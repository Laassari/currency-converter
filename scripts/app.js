var ratesForUsd;
addEventListener('load', () => {
  populateCurrenciesLists()
  getAllRates()
})
addEventListener('DOMContentLoaded', () => {
  const firstAmount = document.getElementById('first-amount') //input amount to convert
  const secondAmount = document.getElementById('second-amount')

  const firstCurrencySelect = document.getElementById('first-select') //input to filter the currencies
  const secondCurrencySelect = document.getElementById('second-select')

  const firstCurrencyHolder = document.getElementById('first-currency-holder') //holds the chosen currency
  const secondCurrencyHolder = document.getElementById('second-currency-holder')

  const firstCurrenciesList = document.querySelectorAll('.select-container ul.options')[0] //list of all currencies
  const secondCurrenciesList = document.querySelectorAll('.select-container ul.options')[1]

  //show list of currencies
  firstCurrencyHolder.addEventListener('click', showList)
  secondCurrencyHolder.addEventListener('click', showList)

  //show the cliked item as chosen currency
  firstCurrenciesList.addEventListener('click', listClicked)
  secondCurrenciesList.addEventListener('click', listClicked)

  //filter lists when searched
  firstCurrencySelect.addEventListener('input', function(){
    renderMatches(this.value, firstCurrenciesList)
  })
  secondCurrencySelect.addEventListener('input', function(){
    renderMatches(this.value, secondCurrenciesList)
  })

  //convert values of input 1
  firstAmount.addEventListener('input', convertInputOne)

  //convert values of input 2
  secondAmount.addEventListener('input', convertInputTwo)


  function convertInputOne() {
    const firstCurrency = ratesForUsd[`USD_${firstCurrencyHolder.dataset.id}`]
    const secondCurrency = ratesForUsd[`USD_${secondCurrencyHolder.dataset.id}`]
    
    if ((!firstCurrency || !secondCurrency) && this.value) {    
      alert("please choose a currency") 
      return
    }
    //1 USD == x curr1 and 1 USD == y curr2 ==> x curr1 == y curr2
    secondAmount.value = ((secondCurrency / firstCurrency) * +firstAmount.value).toFixed(2)
  }
  function convertInputTwo() {
    const firstCurrency = ratesForUsd[`USD_${secondCurrencyHolder.dataset.id}`]
    const secondCurrency = ratesForUsd[`USD_${firstCurrencyHolder.dataset.id}`]
    
    if (!firstCurrency || !secondCurrency) {
      return
    }
    //1 USD == x curr1 and 1 USD == y curr2 ==> x curr1 == y curr2
    firstAmount.value = ((secondCurrency/ firstCurrency) * +secondAmount.value).toFixed(2)
  }
  //hide lists when clicked outside of them
  document.addEventListener('click', (event) => {
    if (event.target.closest('.select-container')) return //ignore when clicked inside a select box
    firstCurrenciesList.classList.remove('show')
    secondCurrenciesList.classList.remove('show')

    ;[firstCurrencyHolder, secondCurrencyHolder].forEach(elem => elem.classList.remove('hide'))
  })

  function showList(event) {
    event.stopPropagation()
    this.previousElementSibling.focus()

    ;[firstCurrenciesList, secondCurrenciesList] //only one list can show at a time
      .filter(el => (el != this.nextElementSibling))[0].classList.remove('show')

    this.classList.add('hide') //hide the div that holds the current currency
    this.nextElementSibling.classList.add('show') //show the list
  }

  function listClicked(event) {
    if (event.target.nodeName === 'UL') return //cliked item isn't a list
    event.stopPropagation()
    const currencyHolder = this.previousElementSibling
    currencyHolder.dataset.id = event.target.closest('li').dataset.id
  
    renderElement(currencyHolder, event.target.closest('li').innerHTML, false)
  
    if (event.target.closest('.first')) convertInputOne()
    if (event.target.closest('.second')) convertInputTwo()
  
    currencyHolder.classList.remove('hide')
    this.classList.remove('show')
  }
})

function renderElement(node, content, isInput) {
  if (isInput) node.value = content
  else {
    node.innerHTML = content
  }

}

async function getCurrenciesList() {
  const blob = await fetch('https://free.currencyconverterapi.com/api/v5/currencies')
  const json = await blob.json()
  return json
}

function populateCurrenciesLists() {
  getCurrenciesList().then(json => {
    const ulElements = document.querySelectorAll('.options')

    Object.values(json.results)
      .sort((a, b) => {
        if (a.currencyName < b.currencyName)
          return -1
        if (a.currencyName > b.currencyName)
          return 1
        return 0
      })
      .forEach(entry => {
        const li = document.createElement('li')
        li.dataset.id = entry.id
        const img = document.createElement('img')
        img.src = `../images/flags/${entry.id.toLowerCase()}.png`
        const content = document.createTextNode(entry.currencyName)
        li.appendChild(img)
        li.appendChild(content)

        ulElements.forEach(ulElement => { //render both ULs
          ulElement.appendChild(li.cloneNode(true))
        })
      })
  })
}


async function renderMatches(value, destNode) {
  const currenciesList = await getCurrenciesList()
  destNode.classList.add('show')

  const matches = Object.values(currenciesList.results).filter(result => { //remove non-matches from results
    const regMatch = new RegExp(value, 'i')
    return result.currencyName.match(regMatch) || result.id.match(regMatch)
  })
  
  destNode.innerHTML = '' //empty the UL
  matches.forEach(entry => {  //render matched results to UL

    const li = document.createElement('li')
    li.dataset.id = entry.id
    const img = document.createElement('img')
    img.src = `../images/flags/${entry.id.toLowerCase()}.png`
    const content = document.createTextNode(entry.currencyName)
    li.appendChild(img)
    li.appendChild(content)


    destNode.appendChild(li)
  })
}


/* get all rates for USD */
async function getAllRates() {
  const currenciesList = await getCurrenciesList()
  let currenciesId = Object.values(currenciesList.results).map(res => res.id) //extract IDs

  let ratesUsd = {}
  window.ratesUsd = {}
  let jsonData = []

  while (currenciesId.length > 0) {

    const maxTwoRates = currenciesId.splice(0, 2)
    jsonData.push(fetchRate(maxTwoRates)) 

  }
  const responses = await Promise.all(jsonData).then(async rates => {
    let results = await Promise.all(rates.map(res => res.json()))

    results.forEach(result => { //populates ratesUsd with rates
      ratesUsd = {...ratesUsd, ...result}
    })
  })
  ratesForUsd = ratesUsd
  return ratesUsd
}



function fetchRate(currencies=[]) {
  if (currencies.length == 1) {
    return fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=USD_${currencies[0]}&compact=ultra`)
  }
  else if (currencies.length == 2) {
    return fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=USD_${currencies[0]},USD_${currencies[1]}&compact=ultra`)
  }
}