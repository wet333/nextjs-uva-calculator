import React from "react";

function Footer(props) {
  return (
    <footer className="w-full bg-slate-900 py-12 mt-8">
      <div className="container mx-auto text-center text-white">
        <p>Creado por Agustin Wet &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export default Footer;
