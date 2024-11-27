// storage.js

// Сохранение данных в LocalStorage
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Данные успешно сохранены в LocalStorage с ключом: ${key}`);
  } catch (error) {
    console.error("Ошибка при сохранении данных в LocalStorage:", error);
  }
}

// Получение данных из LocalStorage
export function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Ошибка при получении данных из LocalStorage:", error);
    return null;
  }
}

// Удаление данных из LocalStorage
export function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    console.log(`Данные с ключом ${key} успешно удалены из LocalStorage`);
  } catch (error) {
    console.error("Ошибка при удалении данных из LocalStorage:", error);
  }
}
