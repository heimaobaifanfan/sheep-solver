import match from './util/match.js'
import helper from './util/helper.js'

const limit = 7
const timeout = 3
const optionsCount = 10
const resultFile = 'game1.json'
const follow = [182,181,180,179,178,37,35,176,159,31,177,162,149,175,166,155,174,173,146,172,171,40,170,169,167,168,165,163,164,161,160,158,157,153,156,154,143,152,147,142,151,136,41,139,130,29,150,28,17,148,132,131,145,133,117,144,129,128,141,137,113,140,125,124,138,121,36,135,134,116,127,126,25,123,122,70,120,118,109,119,115,67,114,110,100]

let stage1
let timeoutCount
let cards, matchInfo
let selected, topList, stepList

function init() {
  let m = match.local()
  cards = m.cards
  topList = helper.init(cards)
  matchInfo = m.matchInfo

  selected = {}
  stepList = []
  stage1 = parseInt(cards.length * 0.6)+20
  timeoutCount = 0

  if (follow.length > 0) {
    console.log('follow====', follow.length)
    follow.forEach(e => {
      select(e)
      console.log(e, topList.length, selectedCount(), '===')
    })
  }

  console.log('options:', topList.length, selectedCount())
  helper.save({ stepList, topList, selected, cards, matchInfo }, resultFile)
  process.exit()
}

function print(list) {
  let a = list.map(e => cards[e].name)
  console.log(a.join(','))
}

function removeItem(list, e) {
  let i = list.indexOf(e)
  if (i >= 0) {
    list.splice(i, 1)
  }
}

function selectedCount() {
  let size = Object.values(selected).map(e => e.length % 3).reduce(((a, b) => a + b), 0)
  return size
}

function select(id) {
  removeItem(topList, id)
  let c = cards[id]
  c.selected = 1
  c.parent.forEach(e => {
    let c1 = cards[e]
    c1.children = c1.children.filter(e1 => e1 != id)
    if (c1.children.length == 0) {
      topList.unshift(c1.idx)
    }
  })
  stepList.push(id)
  let arr = selected[c.type]
  if (!arr) {
    arr = []
    selected[c.type] = arr
  }
  arr.push(id)
}

function undo() {
  let last = stepList.pop()
  let c = cards[last]
  c.selected = 0
  c.parent.forEach(e => {
    let c1 = cards[e]
    c1.children.push(c.idx)
    removeItem(topList, c1.idx)
  })
  topList.push(last)
  removeItem(selected[c.type], last)
}

function run() {
  let t2 = new Date().getTime()
  let count = selectedCount()
  if (count >= limit) {
    return 0
  }

  if (stepList.length >= stage1 && topList.length >= optionsCount) {
    // print(stepList)
    console.log('cost:', (t2 - t1))
    console.log('done:', stepList.length)
    console.log('selected:', count)
    console.log('options:', topList.length)
    console.log(stepList.join(','))
    // console.log('types', stepList.map(e => cards[e] && cards[e].type).join(','))
    helper.save({ stepList, topList, selected, cards, matchInfo }, resultFile)
    process.exit(0)
  }

  if (t2 - t1 > timeout * 1000) {
    if (timeoutCount++ <= 10) {
      console.log('timeout, steps', stepList.length, topList.length, count)
    }
    return 1
  }

  sort()
  let options = topList.concat()
  for (let i = 0; i < options.length; i++) {
    select(options[i])
    run()
    undo()
  }
}

function sort() {
  topList.sort(() => Math.random() - 0.5)
}


let t1, round = 0
while (1) {
  t1 = new Date().getTime()
  init()
  run()
}