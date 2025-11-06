// ia-logic.js

const MODEL_URL = 'ruta/a/tu/modelo/model.json'; // ⚠️ REEMPLAZA CON LA RUTA REAL DE TU MODELO EXPORTADO
const CLASSES = ['bache', 'persona', 'auto', 'semaforo']; // ⚠️ REEMPLAZA CON TUS CLASES DE YOLO

let model;
let webcamActive = false;
let videoElement;
let canvasElement;
let ctx;

const statusMessage = document.getElementById('statusMessage');
const detectionTimeSpan = document.getElementById('detectionTime');

// =========================================================
// 1. CARGA DEL MODELO Y PREPARACIÓN
// =========================================================

async function loadModel() {
    try {
        statusMessage.textContent = 'Cargando modelo... (0%)';
        
        // Simulación de carga: En un proyecto real, se usa tf.loadGraphModel o tf.loadLayersModel
        model = await tf.loadGraphModel(
            MODEL_URL,
            { onProgress: (frac) => {
                statusMessage.textContent = `Cargando modelo... (${Math.round(frac * 100)}%)`;
            }}
        );
        
        statusMessage.textContent = 'Modelo cargado. Listo para detectar.';
        document.getElementById('uploadButton').disabled = false;
        document.getElementById('cameraButton').disabled = false;
        
        // Obtener elementos del DOM
        videoElement = document.getElementById('webcamVideo');
        canvasElement = document.getElementById('detectionCanvas');
        ctx = canvasElement.getContext('2d');
        
    } catch (error) {
        console.error("Error al cargar el modelo:", error);
        statusMessage.textContent = 'ERROR: No se pudo cargar el modelo.';
    }
}

// =========================================================
// 2. LÓGICA DE Detección (Simulada para Visión Vial)
// =========================================================

function processDetection(source) {
    const startTime = performance.now();
    
    // --- Lógica Real de Preprocesamiento y Ejecución (Compleja) ---
    // 1. Preprocesamiento: Convertir el canvas/video a tensor.
    // 2. Ejecución: const predictions = model.execute(tensor);
    // 3. Post-Procesamiento: Interpretar las salidas de YOLO (NMS, filtrado, etc.).
    
    // --- SIMULACIÓN DE RESULTADOS (Para la demostración) ---
    const boxes = [
        [50, 50, 200, 150, 0.95, 0],   // Ejemplo: [x1, y1, x2, y2, score, classId]
        [300, 250, 500, 400, 0.88, 1],
        [150, 350, 250, 450, 0.70, 2],
    ];

    // --- Dibujar en el Canvas ---
    drawBoundingBoxes(source, boxes);

    const endTime = performance.now();
    detectionTimeSpan.textContent = (endTime - startTime).toFixed(2);
}


function drawBoundingBoxes(source, predictions) {
    // Escalar el canvas al tamaño de la imagen/video
    const width = source.width || source.videoWidth;
    const height = source.height || source.videoHeight;
    canvasElement.width = width;
    canvasElement.height = height;

    // Dibujar la imagen o frame de video
    ctx.drawImage(source, 0, 0, width, height);
    ctx.font = '16px Arial';
    ctx.lineWidth = 2;

    predictions.forEach(p => {
        const [x1, y1, x2, y2, score, classId] = p;
        const className = CLASSES[classId];
        
        // Dibujar el rectángulo (BBOX)
        ctx.strokeStyle = '#E30613';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
        // Dibujar la etiqueta
        ctx.fillStyle = '#E30613';
        ctx.fillRect(x1, y1 - 20, ctx.measureText(className).width + 10, 20);
        ctx.fillStyle = 'white';
        ctx.fillText(className + ' (' + (score * 100).toFixed(1) + '%)', x1 + 5, y1 - 5);
    });
}


// =========================================================
// 3. MANEJADORES DE EVENTOS
// =========================================================

// Manejar la subida de imagen
document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('imageUpload').click(); // Abre el diálogo de archivo
});

document.getElementById('imageUpload').addEventListener('change', (event) => {
    if (webcamActive) stopWebcam();
    
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            processDetection(img);
        };
        img.src = URL.createObjectURL(file);
    }
});

// Manejar la cámara web
document.getElementById('cameraButton').addEventListener('click', async () => {
    if (webcamActive) {
        stopWebcam();
    } else {
        startWebcam();
    }
});

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        canvasElement.style.display = 'none';
        
        // Iniciar la detección en bucle
        videoElement.addEventListener('loadeddata', () => {
             // Procesar cada 100ms (10 FPS)
            setInterval(() => processDetection(videoElement), 100); 
        });
        
        webcamActive = true;
        document.getElementById('cameraButton').textContent = '⏹ Detener Cámara';
        statusMessage.textContent = 'Detección en tiempo real (Webcam).';
        
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        statusMessage.textContent = 'ERROR: Acceso a cámara denegado.';
    }
}

function stopWebcam() {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.style.display = 'none';
    canvasElement.style.display = 'block'; // Mostrar canvas vacío o último frame
    webcamActive = false;
    document.getElementById('cameraButton').textContent = '📹 Usar Cámara';
    statusMessage.textContent = 'Modelo cargado. Listo para detectar.';
}


// Iniciar la carga del modelo al cargar la página
loadModel();