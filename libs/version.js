!function addVersion() {
  const links = document.querySelectorAll('link')
  const scripts = document.querySelectorAll('script')
  for (var i = 0; i < links.length; i++) {
    if (links[i].dataset.cache) {
      links[i].href+=`?v=${Math.random()}`
    }
  }
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].dataset.cache) {
      scripts[i].src+=`?v=${Math.random()}`
    }
  }
}()