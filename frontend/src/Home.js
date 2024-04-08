import React, { useState, useEffect, useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

function Home() {
    const [recipes, setRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRecipeIngredients, setSelectedRecipeIngredients] = useState([]);
    const [showIngredientsModal, setShowIngredientsModal] = useState(false);
    const [enteredIngredients, setEnteredIngredients] = useState([]);
    const [basicIngredients, setBasicIngredients] = useState({
        vegetables: ['marchew', 'ziemniak', 'cebula', 'pomidor', 'sałata', 'brokuł', 'papryka', 'czosnek', 'kapusta', 'szpinak'],
        fruits: ['jabłko', 'banan', 'pomarańcza', 'gruszka', 'winogrono', 'truskawka', 'malina', 'ananas', 'kiwi', 'mango'],
        meats: ['kurczak', 'wołowina', 'wieprzowina', 'indyk', 'jajka', 'łosoś', 'tuńczyk', 'szynka', 'kiełbasa', 'cielęcina']
    });

    const fetchRecipes = useCallback((query) => {
        setLoading(true);
        fetch(`http://localhost:8081/recipes/search?ingredients=${query}`)
            .then(response => response.json())
            .then(data => {
                setRecipes(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Błąd podczas pobierania przepisów:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchRecipes('');
    }, [fetchRecipes]);

    const handleSearch = () => {
        fetchRecipes(enteredIngredients.join(','));
        setSearchQuery('');
    };

    const handleLogout = () => {
        window.location.href = "http://localhost:3000/"; 
    };

    const removeEnteredIngredient = (indexToRemove) => {
        setEnteredIngredients(prevIngredients => prevIngredients.filter((_, index) => index !== indexToRemove));
        fetchRecipes(enteredIngredients.filter((_, index) => index !== indexToRemove).join(','));
    };

    const handleShowIngredients = (ingredients) => {
        setSelectedRecipeIngredients(ingredients.split(','));
        setShowIngredientsModal(true);
    };

    const renderIngredients = (ingredients) => {
        return (
            <ul>
                {ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        );
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const normalizedIngredient = encodeURIComponent(searchQuery.trim());
            setEnteredIngredients(prevIngredients => [...prevIngredients, searchQuery.trim()]);
            setSearchQuery('');
            fetchRecipes([...enteredIngredients, searchQuery.trim()].join(','));
        }
    };

    const sortRecipesByOwnedIngredients = () => {
        const sortedRecipes = [...recipes];
        sortedRecipes.forEach(recipe => {
            const recipeIngredients = recipe.ingredients && typeof recipe.ingredients === 'string' ? recipe.ingredients.split(',').map(ingredient => ingredient.trim().toLowerCase()) : [];
            const ownedIngredients = enteredIngredients.filter(ingredient => recipeIngredients.includes(ingredient));
            const missingIngredientsCount = recipeIngredients.length - ownedIngredients.length;
            recipe.missingIngredientsCount = missingIngredientsCount;
        });
        sortedRecipes.sort((a, b) => a.missingIngredientsCount - b.missingIngredientsCount);
        return sortedRecipes;
    };

    const handleSearchBasicIngredient = (ingredient) => {
        const normalizedIngredient = encodeURIComponent(ingredient.trim());
        setEnteredIngredients(prevIngredients => [...prevIngredients, ingredient.trim()]);
        setSearchQuery('');
        fetchRecipes([...enteredIngredients, ingredient.trim()].join(','));
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-secondary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/home">Meal Finder</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/home">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/profile">Profile</a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-danger" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>  
            <div className="container mt-3">
                <div className="input-group mb-3">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter ingredients" 
                        value={searchQuery} 
                        onChange={event => setSearchQuery(event.target.value)} 
                        onKeyDown={handleKeyDown} 
                    />
                    <button className="btn btn-outline-primary" type="button" onClick={handleSearch}>Search</button>
                </div>
                <div>
                    {enteredIngredients.map((ingredient, index) => (
                        <span key={index} className="badge bg-primary me-2 mb-2">
                            {ingredient}
                            <button type="button" className="btn-close ms-2" onClick={() => removeEnteredIngredient(index)}></button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="container mt-5 border-top pt-5">
                <h2>Basic Ingredients</h2>
                <div className="row">
                    <div className="col">
                        <h3>Vegetables</h3>
                        <div className="d-flex flex-wrap">
                            {basicIngredients.vegetables.map((ingredient, index) => (
                                <div key={index} className="badge bg-success me-2 mb-2 p-2" onClick={() => handleSearchBasicIngredient(ingredient)}>
                                    {ingredient}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col">
                        <h3>Fruits</h3>
                        <div className="d-flex flex-wrap">
                            {basicIngredients.fruits.map((ingredient, index) => (
                                <div key={index} className="badge bg-warning me-2 mb-2 p-2" onClick={() => handleSearchBasicIngredient(ingredient)}>
                                    {ingredient}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col">
                        <h3>Meats</h3>
                        <div className="d-flex flex-wrap">
                            {basicIngredients.meats.map((ingredient, index) => (
                                <div key={index} className="badge bg-danger me-2 mb-2 p-2" onClick={() => handleSearchBasicIngredient(ingredient)}>
                                    {ingredient}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {sortRecipesByOwnedIngredients().map(recipe => (
                            <div className="col mb-4" key={recipe.id}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{recipe.name}</h5>
                                        <p>Missing Ingredients: {recipe.missingIngredientsCount}</p>
                                        <img src={recipe.img} alt="Recipe" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                        <div className="d-flex justify-content-between">
                                            <Button variant="info" onClick={() => handleShowIngredients(recipe.ingredients)}>Show Ingredients</Button>
                                            <a href={decodeURIComponent(recipe.url)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Recipe</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal show={showIngredientsModal} onHide={() => setShowIngredientsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Ingredients</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderIngredients(selectedRecipeIngredients)}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Home;
