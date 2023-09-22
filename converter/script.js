const fileInput = document.getElementById('imageInput')
const outputFormat = document.getElementById('outputFormat')
const convertButton = document.getElementById('convertButton')
const downloadLink = document.getElementById('downloadLink')
const fileNameInput = document.getElementById('fileNameInput')
const widthInp = document.getElementById('width')
const heightInp = document.getElementById('height')
const targetColorInp = document.getElementById('targetColor')
const replacementColorInp = document.getElementById('replacementColor')
const shouldDownloadBtn = document.getElementById('shouldDownload')
const redCorrectionInput = document.getElementById('redCorrection')
const greenCorrectionInput = document.getElementById('greenCorrection')
const blueCorrectionInput = document.getElementById('blueCorrection')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

convertButton.addEventListener('click', () => {
  const targetColor = targetColorInp.value
  const replacementColor = replacementColorInp.value
  const selectedFormat = outputFormat.value
  const width = widthInp.value
  const height = heightInp.value
  const redCorrection = redCorrectionInput.value
  const greenCorrection = greenCorrectionInput.value
  const blueCorrection = blueCorrectionInput.value
  const shouldDownload = shouldDownloadBtn.checked
  const fileName = fileNameInput.value || 'image'
  const selectedFile = fileInput.files[0]
  if (selectedFile) {
    const reader = new FileReader()

    reader.readAsDataURL(selectedFile)

    reader.onload = function () {
      const img = new Image()
      img.src = reader.result

      img.onload = function () {
        const { new_width, new_height } = setSize(width, img, height)

        canvas.height = new_height
        canvas.width = new_width
        ctx.drawImage(img, 0, 0, new_width, new_height)

        colorChanger(ctx, canvas, targetColor, replacementColor)

        colorCorrection(
          ctx,
          canvas,
          redCorrection,
          greenCorrection,
          blueCorrection
        )

        canvas.style.display = 'block'

        const dataURL = canvas.toDataURL(`image/${selectedFormat}`) // 'image/img', 'image/webp', 'image/png'

        if (shouldDownload) {
          downloadImage(dataURL, fileName, selectedFormat)
        }
      }
    }
  }
})

function setSize(width, img, height) {
  let new_width, new_height
  if (width != 0) {
    new_width = width
    new_height = (new_width / img.width) * img.height
  } else if (height != 0) {
    new_height = height
    new_width = (new_height / img.height) * img.width
  } else {
    new_height = img.height
    new_width = img.width
  }
  return { new_width, new_height }
}

function colorChanger(ctx, canvas, targetColor, replacementColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const targetColorRGB = hexToRGB(targetColor)
  const replacementColorRGB = hexToRGB(replacementColor)

  for (let i = 0; i < data.length; i += 4) {
    const pixelColor = [data[i], data[i + 1], data[i + 2]]
    if (compareColors(pixelColor, targetColorRGB)) {
      data[i] = replacementColorRGB[0]
      data[i + 1] = replacementColorRGB[1]
      data[i + 2] = replacementColorRGB[2]
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function hexToRGB(hex) {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

function compareColors(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2]
  )
}

function colorCorrection(
  ctx,
  canvas,
  redCorrection,
  greenCorrection,
  blueCorrection
) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + redCorrection, 0, 255)
    data[i + 1] = clamp(data[i + 1] + greenCorrection, 0, 255)
    data[i + 2] = clamp(data[i + 2] + blueCorrection, 0, 255)
  }

  ctx.putImageData(imageData, 0, 0)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function downloadImage(dataURL, fileName, selectedFormat) {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = `${fileName}.${selectedFormat}`
  a.click()
}
