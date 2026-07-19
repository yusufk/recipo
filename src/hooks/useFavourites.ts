const FAVS_KEY = 'recipo_favourites'

export function getFavourites(): string[] {
  const stored = localStorage.getItem(FAVS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isFavourite(path: string): boolean {
  return getFavourites().includes(path)
}

export function toggleFavourite(path: string): boolean {
  const favs = getFavourites()
  const index = favs.indexOf(path)
  if (index >= 0) {
    favs.splice(index, 1)
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs))
    return false
  } else {
    favs.push(path)
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs))
    return true
  }
}
