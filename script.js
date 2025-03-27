// 常量定义
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const GRID_SIZE = 3;

// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const originalImage = document.getElementById('originalImage');
const originalSize = document.getElementById('originalSize');
const gridContainer = document.getElementById('gridContainer');
const downloadAllBtn = document.getElementById('downloadAll');

// 存储切割后的图片数据
let slicedImages = [];

// 事件监听器
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
downloadAllBtn.addEventListener('click', downloadAllImages);

// 处理拖拽事件
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件
function handleFile(file) {
    // 验证文件类型
    if (!ACCEPTED_TYPES.includes(file.type)) {
        alert('请上传PNG或JPG格式的图片！');
        return;
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
        alert('文件大小不能超过10MB！');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            displayOriginalImage(img);
            sliceImage(img);
            showPreviewSection();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 显示原始图片
function displayOriginalImage(img) {
    originalImage.src = img.src;
    originalSize.textContent = `${img.width} × ${img.height}`;
}

// 切割图片
function sliceImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算每个格子的尺寸
    const sliceWidth = img.width / GRID_SIZE;
    const sliceHeight = img.height / GRID_SIZE;
    
    // 设置画布尺寸
    canvas.width = sliceWidth;
    canvas.height = sliceHeight;
    
    // 清空网格容器
    gridContainer.innerHTML = '';
    slicedImages = [];
    
    // 切割并显示图片
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制切割后的图片
            ctx.drawImage(
                img,
                col * sliceWidth,
                row * sliceHeight,
                sliceWidth,
                sliceHeight,
                0,
                0,
                sliceWidth,
                sliceHeight
            );
            
            // 创建网格项
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            
            // 创建图片元素
            const sliceImg = document.createElement('img');
            sliceImg.src = canvas.toDataURL('image/png');
            sliceImg.alt = `切片 ${row * GRID_SIZE + col + 1}`;
            
            // 添加点击事件
            sliceImg.addEventListener('click', () => downloadImage(sliceImg.src, `slice_${row * GRID_SIZE + col + 1}.png`));
            
            // 添加到网格项
            gridItem.appendChild(sliceImg);
            
            // 添加到网格容器
            gridContainer.appendChild(gridItem);
            
            // 保存切片数据
            slicedImages.push({
                data: canvas.toDataURL('image/png'),
                filename: `slice_${row * GRID_SIZE + col + 1}.png`
            });
        }
    }
}

// 显示预览区域
function showPreviewSection() {
    uploadSection.style.display = 'none';
    previewSection.style.display = 'grid';
}

// 下载单张图片
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 下载所有图片
async function downloadAllImages() {
    if (slicedImages.length === 0) return;

    // 创建JSZip实例
    const zip = new JSZip();
    
    // 添加所有图片到zip
    slicedImages.forEach(({ data, filename }) => {
        // 将base64转换为blob
        const base64Data = data.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
    });
    
    // 生成zip文件
    const content = await zip.generateAsync({ type: 'blob' });
    
    // 下载zip文件
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'nine_grid_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 