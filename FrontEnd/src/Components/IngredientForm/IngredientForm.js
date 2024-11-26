import React, { useState, useEffect } from 'react';
import './IngredientForm.css';

const initialDishes = [
  {
    name: "Phở Bò",
    image: "https://th.bing.com/th/id/OIP.OinLsAORruciYmE2S33e4QHaHc?w=203&h=204&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    ingredients: ["Bánh phở", "Thịt bò", "Hành", "Ngò", "Nước dùng"],
    calories: 500,
    price: 60000,
  },
  {
    name: "Bún Chả",
    image: "https://th.bing.com/th/id/OIP.7CPU7nS8rZ00up6qWW96ggHaFj?w=243&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    ingredients: ["Bún", "Thịt nướng", "Rau sống", "Nước mắm"],
    calories: 700,
    price: 70000,
  },
];

// Thông tin giá và calo cho từng nguyên liệu
const ingredientInfo = {
  "Bánh phở": { price: 10000, calories: 200 },
  "Thịt bò": { price: 30000, calories: 300 },
  "Hành": { price: 2000, calories: 10 },
  "Ngò": { price: 1000, calories: 5 },
  "Nước dùng": { price: 5000, calories: 50 },
  "Bún": { price: 8000, calories: 150 },
  "Thịt nướng": { price: 25000, calories: 250 },
  "Rau sống": { price: 5000, calories: 30 },
  "Nước mắm": { price: 2000, calories: 10 },
};

const IngredientForm = () => {
  const [dishes, setDishes] = useState(initialDishes);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', image: '', ingredients: '', calories: 0, price: 0 });
  const [editingIndex, setEditingIndex] = useState(null);
  const [dishDetails, setDishDetails] = useState(null);
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);

  // Cập nhật danh sách món ăn theo tìm kiếm và sắp xếp
  useEffect(() => {
    let results = [...initialDishes];
    if (searchTerm) {
      results = results.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    results = sortAscending ? results.sort((a, b) => a.name.localeCompare(b.name)) : results.sort((a, b) => b.name.localeCompare(a.name));
    setDishes(results);
  }, [searchTerm, sortAscending]);

  // Tính toán tổng giá và calo của món ăn từ nguyên liệu
  const calculateTotals = (ingredients) => {
    let totalPrice = 0;
    let totalCalories = 0;
    ingredients.forEach(ingredient => {
      if (ingredientInfo[ingredient]) {
        totalPrice += ingredientInfo[ingredient].price;
        totalCalories += ingredientInfo[ingredient].calories;
      }
    });
    return { totalPrice, totalCalories };
  };

  // Cập nhật món ăn mới hoặc chỉnh sửa món ăn với calo và giá tiền tự động
  const handleIngredientInput = (e) => {
    const ingredients = e.target.value.split('\n').filter(Boolean);
    const { totalPrice, totalCalories } = calculateTotals(ingredients);
    setNewDish({ ...newDish, ingredients: e.target.value, calories: totalCalories, price: totalPrice });
  };

  // Thêm món ăn
  const handleAddDish = () => {
    const ingredients = newDish.ingredients.split('\n').filter(Boolean);
    const { totalPrice, totalCalories } = calculateTotals(ingredients);
    setDishes([...dishes, { ...newDish, ingredients, calories: totalCalories, price: totalPrice }]);
    setShowAddModal(false);
    setNewDish({ name: '', image: '', ingredients: '', calories: 0, price: 0 });
  };

  // Mở modal chỉnh sửa
  const handleEditDish = index => {
    setEditingIndex(index);
    const dish = dishes[index];
    setNewDish({
      name: dish.name,
      image: dish.image,
      ingredients: dish.ingredients.join('\n'),
      calories: dish.calories,
      price: dish.price,
    });
    setShowEditModal(true);
  };

  // Cập nhật món ăn đang chỉnh sửa
  const handleUpdateDish = () => {
    const updatedDishes = [...dishes];
    updatedDishes[editingIndex] = { ...newDish, ingredients: newDish.ingredients.split('\n').filter(Boolean) };
    setDishes(updatedDishes);
    setShowEditModal(false);
    setNewDish({ name: '', image: '', ingredients: '', calories: 0, price: 0 });
  };

  // Xóa món ăn
  const handleDeleteDish = index => {
    setDishes(dishes.filter((_, i) => i !== index));
  };

  // Hiển thị chi tiết món ăn
  const handleShowDetails = dish => {
    setDishDetails(dish);
    setShowDetailModal(true);
  };

  // Gợi ý nguyên liệu khi nhập
  const handleIngredientSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const suggestions = Object.keys(ingredientInfo).filter(ingredient =>
      ingredient.toLowerCase().includes(searchTerm)
    );
    setIngredientSuggestions(suggestions);
  };

  return (
    <div className="container">
      <h1>Nguyên Liệu Món Ăn</h1>
      <input
        type="text"
        placeholder="Tìm kiếm món ăn..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setSortAscending(!sortAscending)}>
        {sortAscending ? 'Sắp xếp A-Z' : 'Sắp xếp Z-A'}
      </button>
      <button onClick={() => setShowAddModal(true)}>+</button>

      <div className="dish-list">
        {dishes.map((dish, index) => (
          <div key={index} className="dish-item">
            <img src={dish.image} alt={dish.name} />
            <h3>{dish.name}</h3>
            <p>Giá: {dish.price} VND</p>
            <p>Calo: {dish.calories} kcal</p>
            <button onClick={() => handleShowDetails(dish)}>Chi tiết</button>
            <button onClick={() => handleEditDish(index)}>Sửa</button>
            <button onClick={() => handleDeleteDish(index)}>Xóa</button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddModal(false)}>×</span>
            <h2>Thêm Món Ăn</h2>
            <input type="text" placeholder="Tên món ăn" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} />
            <input type="text" placeholder="Hình ảnh URL" value={newDish.image} onChange={e => setNewDish({ ...newDish, image: e.target.value })} />
            <input type="text" placeholder="Tìm nguyên liệu" onChange={handleIngredientSearch} />
            <div className="suggestions">
              {ingredientSuggestions.map((ingredient, i) => (
                <div key={i} onClick={() => setNewDish({ ...newDish, ingredients: newDish.ingredients + '\n' + ingredient })}>
                  {ingredient}
                </div>
              ))}
            </div>
            <textarea placeholder="Nguyên liệu" rows="4" value={newDish.ingredients} onChange={handleIngredientInput} />
            <input type="number" placeholder="Số calo" value={newDish.calories} readOnly />
            <input type="number" placeholder="Giá tiền" value={newDish.price} readOnly />
            <button onClick={handleAddDish}>Thêm</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowEditModal(false)}>×</span>
            <h2>Sửa Món Ăn</h2>
            <input type="text" placeholder="Tên món ăn" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} />
            <input type="text" placeholder="Hình ảnh URL" value={newDish.image} onChange={e => setNewDish({ ...newDish, image: e.target.value })} />
            <textarea placeholder="Nguyên liệu" rows="4" value={newDish.ingredients} onChange={handleIngredientInput} />
            <input type="number" placeholder="Số calo" value={newDish.calories} readOnly />
            <input type="number" placeholder="Giá tiền" value={newDish.price} readOnly />
            <button onClick={handleUpdateDish}>Sửa</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && dishDetails && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowDetailModal(false)}>×</span>
            <h2>Chi Tiết Món Ăn</h2>
            <h3>{dishDetails.name}</h3>
            <p><strong>Nguyên liệu:</strong> {dishDetails.ingredients.join(", ")}</p>
            <p><strong>Calo:</strong> {dishDetails.calories} kcal</p>
            <p><strong>Giá:</strong> {dishDetails.price} VND</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientForm;
