import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { Card, CardHeader, CardBody } from './Card';
import { Button } from './Button';
import { Icons } from './Icon';

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [scanProgress, setScanProgress] = useState('');

  /**
   * Convierte imagen a escala de grises optimizada para QR
   */
  const toGrayscale = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Usar pesos optimizados para QR (mayor peso en rojo y verde)
      const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    return imageData;
  };

  /**
   * Aplica binarización adaptativa (mejor que umbral fijo)
   */
  const adaptiveThreshold = (imageData: ImageData, blockSize: number = 25): ImageData => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Calcular integral de la imagen para cálculo rápido de sumas
    const integral: number[] = new Array((width + 1) * (height + 1)).fill(0);
    
    for (let y = 1; y <= height; y++) {
      let sum = 0;
      for (let x = 1; x <= width; x++) {
        const idx = ((y - 1) * width + (x - 1)) * 4;
        const gray = data[idx];
        sum += gray;
        integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + sum;
      }
    }
    
    // Aplicar umbral adaptativo
    const s = blockSize / 2;
    const t = 15; // Constante de ajuste
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const x1 = Math.max(0, x - s);
        const x2 = Math.min(width - 1, x + s);
        const y1 = Math.max(0, y - s);
        const y2 = Math.min(height - 1, y + s);
        
        const count = (x2 - x1) * (y2 - y1);
        const sum = integral[(y2 + 1) * (width + 1) + (x2 + 1)]
                   - integral[y1 * (width + 1) + (x2 + 1)]
                   - integral[(y2 + 1) * (width + 1) + x1]
                   + integral[y1 * (width + 1) + x1];
        
        const idx = (y * width + x) * 4;
        const threshold = (sum / count) - t;
        const value = data[idx] > threshold ? 255 : 0;
        
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
      }
    }
    
    return new ImageData(output, width, height);
  };

  /**
   * Mejora el contraste usando ecualización de histograma
   */
  const equalizeHistogram = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const histogram = new Array(256).fill(0);
    
    // Calcular histograma
    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++;
    }
    
    // Calcular CDF (Cumulative Distribution Function)
    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    // Normalizar CDF
    const cdfMin = cdf.find(v => v > 0) || 0;
    const totalPixels = imageData.width * imageData.height;
    
    const lut = new Array(256);
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
    }
    
    // Aplicar transformación
    for (let i = 0; i < data.length; i += 4) {
      const value = lut[data[i]];
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    
    return imageData;
  };

  /**
   * Aplica filtro de nitidez para mejorar bordes
   */
  const sharpenImage = (imageData: ImageData): ImageData => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Kernel de nitidez
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[idx] * kernel[kernelIdx];
          }
        }
        
        const idx = (y * width + x) * 4;
        const value = Math.min(255, Math.max(0, sum));
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
      }
    }
    
    return new ImageData(output, width, height);
  };

  /**
   * Reduce ruido con filtro de mediana
   */
  const medianFilter = (imageData: ImageData, size: number = 3): ImageData => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    const halfSize = Math.floor(size / 2);
    
    for (let y = halfSize; y < height - halfSize; y++) {
      for (let x = halfSize; x < width - halfSize; x++) {
        const values: number[] = [];
        
        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            values.push(data[idx]);
          }
        }
        
        values.sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)];
        
        const idx = (y * width + x) * 4;
        output[idx] = median;
        output[idx + 1] = median;
        output[idx + 2] = median;
      }
    }
    
    return new ImageData(output, width, height);
  };

  /**
   * Rota la imagen 90, 180 o 270 grados
   */
  const rotateImage = (canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement => {
    const rotatedCanvas = document.createElement('canvas');
    const ctx = rotatedCanvas.getContext('2d');
    
    if (!ctx) return canvas;
    
    if (degrees === 90 || degrees === 270) {
      rotatedCanvas.width = canvas.height;
      rotatedCanvas.height = canvas.width;
    } else {
      rotatedCanvas.width = canvas.width;
      rotatedCanvas.height = canvas.height;
    }
    
    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    return rotatedCanvas;
  };

  /**
   * Invierte colores
   */
  const invertImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    
    return imageData;
  };

  /**
   * Pipeline de procesamiento completo
   */
  const processImagePipeline = (
    imageData: ImageData,
    pipeline: string[]
  ): ImageData => {
    let processed = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    
    for (const step of pipeline) {
      switch (step) {
        case 'grayscale':
          processed = toGrayscale(processed);
          break;
        case 'equalize':
          processed = equalizeHistogram(processed);
          break;
        case 'sharpen':
          processed = sharpenImage(processed);
          break;
        case 'median':
          processed = medianFilter(processed);
          break;
        case 'adaptive':
          processed = adaptiveThreshold(processed);
          break;
        case 'invert':
          processed = invertImage(processed);
          break;
      }
    }
    
    return processed;
  };

  /**
   * Estrategias de procesamiento organizadas por complejidad
   */
  const getProcessingStrategies = () => {
    return [
      // Estrategias básicas
      {
        name: 'Original',
        pipeline: [],
        scales: [1],
        rotations: [0]
      },
      {
        name: 'Escala de grises',
        pipeline: ['grayscale'],
        scales: [1],
        rotations: [0]
      },
      {
        name: 'Ecualización',
        pipeline: ['grayscale', 'equalize'],
        scales: [1],
        rotations: [0]
      },
      
      // Estrategias intermedias
      {
        name: 'Nitidez',
        pipeline: ['grayscale', 'sharpen'],
        scales: [1],
        rotations: [0]
      },
      {
        name: 'Reducción de ruido',
        pipeline: ['grayscale', 'median', 'sharpen'],
        scales: [1],
        rotations: [0]
      },
      {
        name: 'Binarización adaptativa',
        pipeline: ['grayscale', 'adaptive'],
        scales: [1],
        rotations: [0]
      },
      
      // Estrategias avanzadas
      {
        name: 'Pipeline completo',
        pipeline: ['grayscale', 'median', 'equalize', 'sharpen', 'adaptive'],
        scales: [1],
        rotations: [0]
      },
      {
        name: 'Invertido',
        pipeline: ['grayscale', 'equalize', 'sharpen', 'invert'],
        scales: [1],
        rotations: [0]
      },
      
      // Con diferentes escalas
      {
        name: 'Multi-escala',
        pipeline: ['grayscale', 'equalize', 'sharpen'],
        scales: [0.5, 1, 1.5, 2],
        rotations: [0]
      },
      
      // Con rotaciones
      {
        name: 'Multi-rotación',
        pipeline: ['grayscale', 'equalize', 'adaptive'],
        scales: [1],
        rotations: [0, 90, 180, 270]
      },
      
      // Combinación final (más agresiva)
      {
        name: 'Todas las variaciones',
        pipeline: ['grayscale', 'median', 'equalize', 'sharpen', 'adaptive'],
        scales: [0.75, 1, 1.25, 1.5],
        rotations: [0, 90, 180, 270]
      }
    ];
  };

  /**
   * Intenta escanear con todas las estrategias
   */
  const tryAllStrategies = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const strategies = getProcessingStrategies();
    let attemptCount = 0;
    const maxAttempts = strategies.reduce(
      (sum, s) => sum + s.scales.length * s.rotations.length,
      0
    );
    
    for (const strategy of strategies) {
      setScanProgress(`Probando: ${strategy.name}...`);
      
      for (const scale of strategy.scales) {
        for (const rotation of strategy.rotations) {
          attemptCount++;
          setScanProgress(
            `Probando: ${strategy.name} (${attemptCount}/${maxAttempts})...`
          );
          
          // Crear canvas temporal
          let tempCanvas = document.createElement('canvas');
          let tempCtx = tempCanvas.getContext('2d');
          
          if (!tempCtx) continue;
          
          // Aplicar escala
          const scaledWidth = Math.round(width * scale);
          const scaledHeight = Math.round(height * scale);
          tempCanvas.width = scaledWidth;
          tempCanvas.height = scaledHeight;
          tempCtx.drawImage(ctx.canvas, 0, 0, scaledWidth, scaledHeight);
          
          // Aplicar rotación
          if (rotation !== 0) {
            tempCanvas = rotateImage(tempCanvas, rotation);
            tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) continue;
          }
          
          // Obtener datos de imagen
          const imageData = tempCtx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );
          
          // Aplicar pipeline de procesamiento
          const processed = processImagePipeline(imageData, strategy.pipeline);
          
          // Intentar decodificar
          const code = jsQR(processed.data, processed.width, processed.height, {
            inversionAttempts: 'attemptBoth'
          });
          
          if (code) {
            setScanProgress(`¡Código detectado con: ${strategy.name}!`);
            return code;
          }
          
          // Pequeña pausa para no bloquear UI
          if (attemptCount % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }
    }
    
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    setIsScanning(true);
    setError('');
    setScanProgress('Cargando imagen...');

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        setImagePreview(imageDataUrl);

        const img = new Image();
        
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            setError('Error al procesar la imagen');
            setIsScanning(false);
            return;
          }

          // Optimizar tamaño para mejor rendimiento
          const maxSize = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          setScanProgress('Analizando imagen con múltiples técnicas...');

          // Intentar con todas las estrategias
          const code = await tryAllStrategies(ctx, width, height);

          if (code) {
            try {
              // Intentar parsear como JSON
              const qrData = JSON.parse(code.data);
              
              if (qrData.id && qrData.tipo === 'equipo') {
                setScanProgress('¡Equipo encontrado! Redirigiendo...');
                setTimeout(() => {
                  navigate(`/equipos/${qrData.id}`);
                  onClose();
                }, 500);
              } else {
                setError('El código QR no corresponde a un equipo válido');
                setScanProgress('');
              }
            } catch (parseError) {
              // Si no es JSON, buscar ID en URL
              const urlMatch = code.data.match(/equipos\/(\d+)/);
              if (urlMatch) {
                const equipoId = urlMatch[1];
                setScanProgress('¡Equipo encontrado! Redirigiendo...');
                setTimeout(() => {
                  navigate(`/equipos/${equipoId}`);
                  onClose();
                }, 500);
              } else {
                setError('No se pudo interpretar el código QR');
                setScanProgress('');
              }
            }
          } else {
            setError(
              'No se pudo detectar el código QR. Intenta con: \n' +
              '• Mejor iluminación (luz natural si es posible)\n' +
              '• Foto más cercana y enfocada\n' +
              '• Ángulo frontal (no inclinado)\n' +
              '• Fondo uniforme sin texturas\n' +
              '• Sin reflejos en el código'
            );
            setScanProgress('');
          }

          setIsScanning(false);
        };

        img.onerror = () => {
          setError('Error al cargar la imagen');
          setIsScanning(false);
          setScanProgress('');
        };

        img.src = imageDataUrl;
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        setIsScanning(false);
        setScanProgress('');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al escanear QR:', err);
      setError('Error al procesar la imagen');
      setIsScanning(false);
      setScanProgress('');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Icons.Package className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Escanear Código QR</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                disabled={isScanning}
              >
                <Icons.X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </CardHeader>

          <CardBody className="p-6 space-y-4">
            {/* Área de carga */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={!isScanning ? handleButtonClick : undefined}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-h-64 mx-auto rounded"
                  />
                  {!isScanning && (
                    <p className="text-sm text-neutral-600">
                      Click para seleccionar otra imagen
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <Icons.Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-700 font-medium mb-2">
                    Sube una foto del código QR
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Arrastra una imagen aquí o haz click para seleccionar
                  </p>
                  <Button variant="secondary" type="button">
                    Seleccionar imagen
                  </Button>
                </>
              )}
            </div>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Progreso de escaneo */}
            {isScanning && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-800 font-medium">
                      Escaneando código QR...
                    </p>
                    {scanProgress && (
                      <p className="text-sm text-blue-700 mt-1">
                        {scanProgress}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-2">
                      Esto puede tomar unos segundos. Estamos probando múltiples
                      técnicas de procesamiento para detectar el código.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="flex items-start space-x-3">
                  <Icons.X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 text-sm whitespace-pre-line">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instrucciones */}
            <div className="bg-neutral-50 border border-neutral-200 rounded p-4">
              <p className="text-sm text-neutral-700 font-medium mb-2 flex items-center">
                <Icons.Package className="w-4 h-4 mr-2" />
                📸 Consejos para mejores resultados:
              </p>
              <ul className="text-sm text-neutral-600 space-y-1.5">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Luz natural:</strong> Usa luz del día o buena iluminación artificial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Distancia:</strong> El QR debe ocupar al menos 1/3 de la foto</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Enfoque:</strong> Asegúrate de que esté nítido y sin desenfoques</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Ángulo frontal:</strong> Toma la foto de frente, perpendicular al código</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Evita reflejos, sombras marcadas y fondos con patrones</span>
                </li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                onClick={onClose}
                variant="ghost"
                disabled={isScanning}
              >
                Cancelar
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}