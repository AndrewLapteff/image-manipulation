const fileInput = document.getElementById('imageInput')
const fileInput2 = document.getElementById('imageInput2')
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
const transparencyInput = document.getElementById('transparency')
const rowSplitInput = document.getElementById('rowSplit')
const colSplitInput = document.getElementById('colSplit')
const cropXInput = document.getElementById('cropX')
const cropYInput = document.getElementById('cropY')
const cropWidthInput = document.getElementById('cropWidth')
const cropHeightInput = document.getElementById('cropHeight')
const contrastInput = document.getElementById('contrastInput')
const numClonesInput = document.getElementById('numClones')
const mergeDirection = document.getElementById('mergeDirection')
const watermarkText = document.getElementById('watermarkText')
const opacityInput = document.getElementById('opacity')
const textColorInput = document.getElementById('textColor')
const fontScaleInput = document.getElementById('fontScale')
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
  const transparency = transparencyInput.value / 100
  const rowSplit = parseInt(rowSplitInput.value)
  const colSplit = parseInt(colSplitInput.value)
  const cropX = parseInt(cropXInput.value)
  const cropY = parseInt(cropYInput.value)
  const cropWidth = parseInt(cropWidthInput.value)
  const cropHeight = parseInt(cropHeightInput.value)
  const contrast = contrastInput.value
  const numClones = numClonesInput.value
  const selectedFile = fileInput.files[0]
  const selectedFile2 = fileInput2.files[0]
  const text = watermarkText.value
  const opacity = opacityInput.value / 100
  const textColor = textColorInput.value
  const direction = mergeDirection.value
  const fontScale = fontScaleInput.value

  if (selectedFile) {
    const reader = new FileReader()

    reader.readAsDataURL(selectedFile)

    reader.onload = function () {
      let img = new Image()
      let img2 = new Image()
      img.src = reader.result

      img.onload = function () {
        cloneAndPositionImagesOnCanvas(ctx, canvas, img, numClones)
        const { new_width, new_height } = setSize(width, img, height)

        canvas.height = new_height
        canvas.width = new_width

        if (selectedFile2) {
          const reader2 = new FileReader()
          reader2.readAsDataURL(selectedFile2)
          reader2.onload = function () {
            img2.src = reader2.result
            if (direction === 'horizontal') {
              canvas.width = img.width + img2.width
              canvas.height = Math.max(img.height, img2.height)
              ctx.drawImage(img, 0, 0)
              ctx.drawImage(img2, img.width, 0)
              methods(
                targetColor,
                replacementColor,
                redCorrection,
                greenCorrection,
                blueCorrection,
                numClones,
                img,
                colSplit,
                rowSplit,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                contrast,
                selectedFormat,
                shouldDownload,
                fileName,
                transparency,
                text,
                opacity,
                textColor,
                fontScale
              )
            } else if (direction === 'vertical') {
              canvas.width = Math.max(img.width, img2.width)
              canvas.height = img.height + img2.height
              ctx.drawImage(img, 0, 0)
              ctx.drawImage(img2, 0, img.height)
            }
          }
        } else {
          ctx.drawImage(img, 0, 0, new_width, new_height)

          methods(
            targetColor,
            replacementColor,
            redCorrection,
            greenCorrection,
            blueCorrection,
            numClones,
            img,
            colSplit,
            rowSplit,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            contrast,
            selectedFormat,
            shouldDownload,
            fileName,
            transparency,
            text,
            opacity,
            textColor,
            fontScale
          )
        }
      }
    }
  }
})

function methods(
  targetColor,
  replacementColor,
  redCorrection,
  greenCorrection,
  blueCorrection,
  numClones,
  img,
  colSplit,
  rowSplit,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  contrast,
  selectedFormat,
  shouldDownload,
  fileName,
  transparency,
  text,
  opacity,
  textColor,
  fontScale
) {
  ctx.globalAlpha = transparency

  colorChanger(ctx, canvas, targetColor, replacementColor)

  colorCorrection(ctx, canvas, redCorrection, greenCorrection, blueCorrection)

  if (numClones) cloneAndPositionImagesOnCanvas(ctx, canvas, img, numClones)

  crop(img, colSplit, rowSplit, cropX, cropY, cropWidth, cropHeight)

  contrastImage(canvas, contrast)

  watermark(opacity, textColor, fontScale, text)

  canvas.style.display = 'block'

  const dataURL = canvas.toDataURL(`image/${selectedFormat}`) // 'image/img', 'image/webp', 'image/png'

  if (shouldDownload) {
    downloadImage(dataURL, fileName, selectedFormat)
  }
}

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
    data[i] = data[i] + redCorrection / 1
    data[i + 1] = data[i + 1] + greenCorrection / 1
    data[i + 2] = data[i + 2] + blueCorrection / 1
  }

  ctx.putImageData(imageData, 0, 0)
}

function downloadImage(dataURL, fileName, selectedFormat) {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = `${fileName}.${selectedFormat}`
  a.click()
}

function crop(img, colSplit, rowSplit, cropX, cropY, cropWidth, cropHeight) {
  const imageWidth = img.width
  const imageHeight = img.height
  const partWidth = imageWidth / colSplit
  const partHeight = imageHeight / rowSplit
  for (let row = 0; row < rowSplit; row++) {
    for (let col = 0; col < colSplit; col++) {
      const partX = col * partWidth
      const partY = row * partHeight
      ctx.clearRect(partX + cropX, partY + cropY, cropWidth, cropHeight) // x, y, width, height
    }
  }
}

function cloneAndPositionImagesOnCanvas(ctx, canvas, img, numClones) {
  const imageWidth = img.width
  const imageHeight = img.height

  const totalCloneWidth = imageWidth * numClones
  const scaleFactor = canvas.width / totalCloneWidth
  const cloneWidth = imageWidth * scaleFactor
  const cloneHeight = imageHeight * scaleFactor

  canvas.width = totalCloneWidth
  canvas.height = cloneHeight

  for (let i = 0; i < numClones; i++) {
    const cloneX = imageWidth * i * scaleFactor
    const cloneY = 0

    ctx.drawImage(img, cloneX, cloneY, cloneWidth, cloneHeight)
  }
}

function contrastImage(canvas, contrast) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  var d = imageData.data
  contrast = contrast / 100 + 1 // Конвертуємо у десятковий формат та зміщуємо діапазон: [0..2]

  var intercept = 128 * (1 - contrast)
  for (var i = 0; i < d.length; i += 4) {
    d[i] = d[i] * contrast + intercept
    d[i + 1] = d[i + 1] * contrast + intercept
    d[i + 2] = d[i + 2] * contrast + intercept
  }
  ctx.putImageData(imageData, 0, 0)
}

function watermark(opacity, textColor, fontScale, text) {
  ctx.globalAlpha = opacity
  ctx.fillStyle = textColor
  ctx.font = `${fontScale}px Arial`
  ctx.fillText(text, 20, canvas.height - 20)
}
