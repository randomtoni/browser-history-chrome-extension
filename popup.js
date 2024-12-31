document.addEventListener('DOMContentLoaded', () => {
    // Set today date for start-date and end-date
    const today = new Date().toISOString().split('T')[0]
    document.getElementById('start-date').value = today
    document.getElementById('end-date').value = today
})
  
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
            maxResults: 1000 // Adjust based on your needs
        },
        (results) => {
            const historyList = document.getElementById('history-list')
            historyList.innerHTML = '' // Clear the list
            results.forEach((item) => {
                const listItem = document.createElement('ul')
                const pItem = document.createElement('p')
                const urlItem = document.createElement('a')
                const timeParts = new Date(item.lastVisitTime).toISOString().split('T')[1].split(":")
                const time = `${timeParts[0]}:${timeParts[1]}hs`
                urlItem.textContent = `${time} - ${item.title}`
                urlItem.href = item.url
                pItem.appendChild(urlItem)
                listItem.appendChild(pItem)
                historyList.appendChild(listItem)
            })
    
            // Show the filter input
            const filterInput = document.getElementById('filter')
            filterInput.style.display = 'block'
            
            const mainContainer = document.getElementsByClassName('container')[0]
            console.log("mainContainer", mainContainer)
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