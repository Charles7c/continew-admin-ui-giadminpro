type ImportVueFileType = typeof import('*.vue')
type ImportVueFileFnType = () => Promise<ImportVueFileType>

const moduleFiles = import.meta.glob<ImportVueFileType>('@/views/**/*.vue')

export const asyncRouteModules = Object.entries(moduleFiles).reduce((routes, [url, importFn]) => {
  if (!/\/(views\/login|components)\//.test(url)) {
    const path = url.replace('/src/views/', '').replace('.vue', '')
    routes[path] = importFn
  }

  return routes
}, {} as Recordable<ImportVueFileFnType>)
