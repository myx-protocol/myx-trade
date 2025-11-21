export const encodeSortValue = <T extends { sortValue: any; id: number | string }>(item: T) => {
  console.log('sortData:', { sortValue: item.sortValue, id: item.id })
  const str = btoa(JSON.stringify({ sortValue: item.sortValue, id: item.id }))
  return str
}
