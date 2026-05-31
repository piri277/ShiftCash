import React, { useEffect, useState } from 'react';
import "../../styles/SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Tiempo total de la animación de carga (puedes ajustarlo)
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Esperamos a que termine la animación de fadeOut para desmontar
      setTimeout(onFinish, 500); 
    }, 3500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoText = "ShiftCash";

  return (
    <div className={`splash-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="brand-logo splash-logo">
          {logoText.split("").map((char, index) => (
            <span 
              key={index} 
              className={`bounce-letter ${index >= 5 ? 'cash-part' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="splash-loader-bg">
          <div className="splash-loader-fill"></div>
        </div>
      </div>
    </div>
  );
}