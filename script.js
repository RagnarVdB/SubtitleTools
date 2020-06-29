'use strict'
let subs
let stretch = 1
let delay = 0
let filename = 'subtitles.srt'

function changeTime(time) {
  const secs = stretch * hmsToSec(time) + delay
  return secToHms(secs)
}

function hmsToSec(value) {
  const splitted = value.replace(/,/g, '.').split(':')
  let secs = 0
  for (let i = 0; i < splitted.length; i++) {
    secs += splitted[i]*60**(2 - i)
  }
  return secs
}

function secToHms(value) {
  let hms = String(Math.floor(value / 3600)).padStart(2, 0) + ':'
  hms += String(Math.floor((value % 3600) / 60)).padStart(2, 0) + ':'
  hms += String(Math.floor(value % 60)).padStart(2, 0) + ','
  hms += String(Math.round((value - Math.floor(value)) * 1000)).padEnd(3, 0)
  return hms
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getSubs() {
  const newSubs = []
  for (let sub of subs) {
    newSubs.push([sub[0], [changeTime(sub[1][0]), changeTime(sub[1][1])], sub[2]])
  }
  let subString = ''
  for (const sub of newSubs) {
    subString += `${sub[0]}\r\n${sub[1][0]} --> ${sub[1][1]}\r\n${sub[2]}\r\n`
  }
  download(filename, subString)
}

function processFile(input) {
  subs = input.split(/\n\s*\n/).map((el) => {
    const elements = el.split('\r\n')
    if (elements.length >= 3) {
      const times = elements[1].split(' --> ')
      return [elements[0], times, elements.slice(2, elements.length).join('\n')]
    }
  }).filter(el => (el && el.length === 3))
  document.getElementById('num1').max = subs.length
  document.getElementById('num2').max = subs.length
  document.getElementById('num2').value = subs.length
  document.getElementById('firstSub').innerHTML = subs[0][2]
  document.getElementById('secondSub').innerHTML = subs[subs.length - 1][2]
}

function numberChange() {
  const n1 = document.getElementById('num1').value
  const n2 = document.getElementById('num2').value
  document.getElementById('firstSub').innerHTML = subs[n1 -1][2]
  document.getElementById('secondSub').innerHTML = subs[n2 -1][2]
  calcValues()
}

function dropHandler(event) {
  event.preventDefault()
  console.log('dropped something!')
  let file

  if (event.dataTransfer.items) {
    if (event.dataTransfer.items[0].kind === 'file') {
      file = event.dataTransfer.items[0].getAsFile()
    }
  } else {
    file =  event.dataTransfer.files[0]
  }

  filename = file.name
  const reader = new FileReader()
  reader.readAsText(file);
  reader.onload = () => {
  processFile(reader.result)
  }
  reader.onerror = () => {
  console.log(reader.error)
  }
  const area = document.getElementById('dropArea')
  area.remove()
}

function dragHandler(event) {
  event.preventDefault()
  console.log('dragging...')
}

function dragEnter() {
  const area = document.getElementById('dropArea')
  area.classList.add('hover')
}

function dragLeave() {
  const area = document.getElementById('dropArea')
  area.classList.remove('hover')
}

function fileSelected() {
  const fileobj = document.getElementById('fileChooser')
  if ('files' in fileobj && fileobj.files.length !== 0) {
    const file = fileobj.files[0]
    filename = file.name
    const reader = new FileReader()
    reader.readAsText(file);
    reader.onload = () => {
    processFile(reader.result)
    }
   reader.onerror = () => {
    console.log(reader.error)
   }
  }
  const area = document.getElementById('dropArea')
  area.remove()
}

function calcValues() {
  const n1 = document.getElementById('num1').value
  const n2 = document.getElementById('num2').value

  const firstTime = [...document.querySelectorAll('#firstTime input')].map(el => Number(el.value))
  const secondTime = [...document.querySelectorAll('#secondTime input')].map(el => Number(el.value))
  const y1 = 3600*firstTime[0] + 60*firstTime[1] + firstTime[2]
  const y2 = 3600*secondTime[0] + 60*secondTime[1] + secondTime[2]
  const x1 = hmsToSec(subs[n1 - 1][1][0])
  const x2 = hmsToSec(subs[n2 - 1][1][0])
  if (y2) {
    stretch = (y2 - y1)/(x2 - x1)
  } else {
    stretch = 1
  }
  delay = y1 - stretch * x1  
  document.getElementById('stretch').innerHTML = Math.round(stretch * 100000)/1000
  document.getElementById('delay').innerHTML = Math.round(delay*100)/100
}
