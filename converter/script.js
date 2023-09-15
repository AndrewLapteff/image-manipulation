const fileInput = document.getElementById('imageInput')
const outputFormat = document.getElementById('outputFormat')
const convertButton = document.getElementById('convertButton')
const downloadLink = document.getElementById('downloadLink')
const fileNameInput = document.getElementById('fileNameInput')
const widthInp = document.getElementById('width')
const heightInp = document.getElementById('height')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

convertButton.addEventListener('click', () => {
  const selectedFormat = outputFormat.value
  const width = widthInp.value
  const height = heightInp.value
  const fileName = fileNameInput.value
  const selectedFile = fileInput.files[0]

  if (selectedFile) {
    const reader = new FileReader()

    reader.readAsDataURL(selectedFile)

    reader.onload = function () {
      const img = new Image()
      img.src = reader.result

      img.onload = function () {
        let new_width, new_height
        if (width != 0) {
          new_width = width
          new_height = (new_width / img.width) * img.height
        } else {
          new_height = height
          new_width = (new_height / img.height) * img.width
        }
        canvas.height = new_height
        canvas.width = new_width
        ctx.drawImage(img, 0, 0, new_width, new_height)

        canvas.style.display = 'block'

        const dataURL = canvas.toDataURL(`image/${selectedFormat}`) // 'image/img', 'image/webp', 'image/png'

        const a = document.createElement('a')
        a.href = dataURL
        console.log(fileName)
        a.download = `${fileName}.${selectedFormat}`
        a.click()
      }
    }
  }
})
