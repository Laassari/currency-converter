addEventListener('load', () => {
  populateCurrenciesLists()
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



  //hide lists when clicked outside of them
  document.addEventListener('click', () => {
    firstCurrenciesList.classList.remove('show')
    secondCurrenciesList.classList.remove('show')
  })
})

function renderElement(node, content, isInput) {
  if (isInput) node.value = content
  else {
    node.innerHTML = content
  }

}

function listClicked(event) {
  event.stopPropagation()
  const currencyHolder = this.previousElementSibling
  renderElement(currencyHolder, event.target.innerHTML, false)
  currencyHolder.classList.remove('hide')
  this.classList.remove('show')
}

function showList(event) {
  event.stopPropagation()
  console.log(this)
  this.classList.add('hide') //hide the div that holds the current currency
  this.nextElementSibling.classList.add('show') //show the list
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
          return -1;
        if (a.currencyName > b.currencyName)
          return 1;
        return 0;
      })
      .forEach(entry => {
        const li = document.createElement('li')
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