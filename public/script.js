function handleChange() {
  cleanUp()
  renderImage(this.files[0])
}

function init() {
  // handle input changes
  document.getElementById('insert-file').addEventListener('change', handleChange)
  document.getElementById('upload-image').addEventListener('click', uploadImage)
}

function uploadImage() {
  var image = document.querySelector('img')
  if(!image.src) return

  var name = document.querySelector('#name').value
  if(!name || name.length < 4) {
    alert('invlaid name')
    return
  }

  var file = dataURItoBlob(image.src)
  var form = new FormData()
  var xhr = new XMLHttpRequest()
  form.append('name', name)
  form.append("myFile", file)
  form.append("ext", file.type)
  xhr.open("POST", "/user", true)
  xhr.onreadystatechange = () => {
    if(xhr.readyState === 4 && xhr.status === 200) {
      alert('sucessfully user created')
    } else if(xhr.readyState === 4 && xhr.status === 400) {
      alert('Please upload an image')
    }
  }
  xhr.send(form)
}

function updateUrl(text) {
  var el = document.querySelector('#copyurl')
  el.href = text
  el.innerHTML  = text
}

//clean up the previous image
function cleanUp() {
  document.getElementById('image-container').innerHTML= '<img src="" id="target">'
}

//render the image in view'
function renderImage(file) {
  //generate a new file reader object
  var reader = new FileReader()
  reader.onload = (event) => {
    var the_url = event.target.result
    document.getElementById('target').src = the_url
}
  reader.readAsDataURL(file);
}


// convert base64/URLEncoded data component to raw binary data held in a string
function dataURItoBlob(dataURI) {
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1])
  else
    byteString = unescape(dataURI.split(',')[1])
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], {type:mimeString})
}

init()
