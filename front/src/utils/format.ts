export const jsonSnakeToCamel = (obj: any): any => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      if (newKey !== key) {
        obj[newKey] = obj[key]
        delete obj[key]
      }
      if (typeof obj[newKey] === 'object' && obj[newKey] !== null) {
        jsonSnakeToCamel(obj[newKey])
      }
    }
  }
  return obj
}
