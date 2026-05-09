// ========= START: bp-tango-dev/src/components/SideMenu.js (CORRECTED AND FINAL) =========
import React from 'react';

// The hardcoded CATEGORY_DETAILS array has been REMOVED from this file.

function SideMenu({
  isOpen,
  onClose,
  // MODIFICATION: Prop name changed from 'allCategories' to 'categoriesToDisplay'
  // It now expects an array of category OBJECTS {id, name, image}, not just IDs.
  categoriesToDisplay,
  activeCategories,
  onToggleCategory,
  onJumpToCategory,
}) {

  return (
    <>
      <div className={`side-menu-overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose} />
      
      <div className={`side-menu ${isOpen ? 'is-open' : ''}`}>
        <div className="side-menu-header">
          <h2>Categories</h2>
          <button onClick={onClose} className="close-menu-btn">&times;</button>
        </div>
        <div className="side-menu-content">
          <p>Click a category to jump to it. Click the eye icon to hide or show words from that category.</p>
          <ul className="category-jump-list">
            {/* MODIFICATION: The map now iterates directly over the array of category objects. */}
            {categoriesToDisplay.map(categoryDetail => {
              const isActive = activeCategories.includes(categoryDetail.id);
              // The slow `.find()` method is no longer needed.

              return (
                <li key={categoryDetail.id} className="category-jump-item">
                  <button 
                    className={`jump-button ${!isActive ? 'disabled' : ''}`}
                    onClick={() => onJumpToCategory(categoryDetail.id)}
                    disabled={!isActive}
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}${categoryDetail.image}`} 
                      alt={categoryDetail.name} 
                      className="category-thumbnail" 
                    />
                    <span>{categoryDetail.name}</span>
                  </button>
                  <button 
                    className={`toggle-visibility-btn ${isActive ? 'visible' : 'hidden'}`}
                    onClick={() => onToggleCategory(categoryDetail.id)}
                    title={isActive ? 'Hide Category' : 'Show Category'}
                  >
                    👁
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default SideMenu;
// ========= END: bp-tango-dev/src/components/SideMenu.js (CORRECTED AND FINAL) =========