/**
 * 本地存储工具类
 */

/**
 * 设置LocalStorage
 */
export const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('LocalStorage设置失败:', error)
  }
}

/**
 * 获取LocalStorage
 */
export const getLocalStorage = (key: string) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('LocalStorage获取失败:', error)
    return null
  }
}

/**
 * 删除LocalStorage
 */
export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('LocalStorage删除失败:', error)
  }
}

/**
 * 清空LocalStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('LocalStorage清空失败:', error)
  }
}
