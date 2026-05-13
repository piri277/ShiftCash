import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white py-4" id="footer">
      <div className="container text-center">
        <div className="row">
          <div className="col-md-12">
            <p className="mb-1">
              <strong>Shift<span className="text-primary">Cash</span></strong>
            </p>
            <p className="small text-muted">
              Gestionando tus finanzas con soluciones innovadoras.
            </p>
            <hr className="bg-secondary" />
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;