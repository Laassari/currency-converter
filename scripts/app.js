addEventListener('load', () => {
  populateCurrenciesLists()
})

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