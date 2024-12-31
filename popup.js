document.addEventListener('DOMContentLoaded', () => {
    // Set today date for start-date and end-date
    let date = new Date()
    const d = date.getDate()
    const m = date.getMonth()+1
    const y = date.getFullYear()
    const today = `${y}-${m}-${d}`
    document.getElementById('start-date').value = today
    document.getElementById('end-date').value = today
})

let urlsDates = new Map()

async function getUrlDate(url) {
    const fetchData = new Promise((res) => {
        chrome.history.getVisits(
            {url},
            (visitItems) => {
                let times = []
                visitItems.forEach(item => {
                    times.push(item.visitTime)
                })
                res(times)
            }
        )
    })
    return fetchData
}
  
document.getElementById('search').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value
    const startTime = document.getElementById('start-time').value
    const endDate = document.getElementById('end-date').value
    const endTime = document.getElementById('end-time').value
  
    if (!startDate || !startTime || !endDate || !endTime) {
      alert('Please select both dates and times.')
      return
    }
  
    // Combine date and time into a single timestamp
    const startDateTime = new Date(`${startDate}T${startTime}`).getTime()
    const endDateTime = new Date(`${endDate}T${endTime}`).getTime()
  
    if (startDateTime > endDateTime) {
      alert('Start date and time must be before end date and time.')
      return
    }      
  
    // Use the chrome.history API
    chrome.history.search(
        {
            text: '', // Empty string to match all items
            startTime: startDateTime,
            endTime: endDateTime,
            maxResults: 9999 // Adjust based on your needs
        },
        async (results) => {
            const historyList = document.getElementById('history-list')
            historyList.innerHTML = '' // Clear the list
            let currentDate = endDateTime
            await results.forEach(async (item) => {
                const listItem = document.createElement('ul')
                const pItem = document.createElement('p')
                const urlItem = document.createElement('a')
                
                let dates = null
                if (urlsDates.has(item.url)) dates = urlsDates.get(item.url)
                else {
                    dates = await getUrlDate(item.url)
                    urlsDates.set(item.url, dates)
                }
                let date = null
                for (let d of dates.reverse()) {
                    if (!date && d<currentDate && d>=startDateTime) {
                        date = d
                    }
                }
                currentDate = date

                const d = new Date(date)
                const timeParts = d.toISOString().split('T')[1].split(":")
                const offset = d.getTimezoneOffset()
                const h = timeParts[0]
                const m = timeParts[1]
                const hour = Number(h)-Math.min(offset/60)
                const minutes = Number(m)-offset%60
                const time = `${hour<0?24+hour:hour}:${minutes}hs`

                urlItem.textContent = `${time} - ${item.title||item.url}`
                urlItem.href = item.url
                pItem.appendChild(urlItem)
                listItem.appendChild(pItem)
                historyList.appendChild(listItem)
            })
    
            // Show the filter input
            const filterInput = document.getElementById('filter')
            filterInput.style.display = 'block'
            
            const mainContainer = document.getElementsByClassName('container')[0]
            mainContainer.style["min-width"] = "600px"
            
            // Add filter functionality
            filterInput.addEventListener('input', (e) => {
                const filterText = e.target.value.toLowerCase()
                Array.from(historyList.children).forEach((listItem) => {
                    const aElement = listItem.firstChild.firstChild
                    const text = aElement.textContent || aElement.innerText
                    listItem.style.display = text.includes(filterText) ? '' : 'none'
                })
            }) 
        }
    )
})  