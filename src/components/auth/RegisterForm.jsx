import React, { useState } from 'react';
import { registerUser } from '../../api'; // Crearemos este archivo después

const RegisterForm = () => {
  // Estados para datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Estados para errores
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Estado para error general
  const [formError, setFormError] = useState('');
  
  // Estado para carga
  const [isLoading, setIsLoading] = useState(false);
  
  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      // Limpiar errores previos
      setErrors({ name: '', email: '', password: '' });
      
      // Llamar a la API de registro
      const response = await registerUser(formData);
      
      // Éxito: manejar respuesta (guardar token, redirigir, etc.)
      console.log('Registro exitoso:', response.data);
      alert('¡Registro exitoso!');
      
    } catch (error) {
      // Manejar errores de validación
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const newErrors = { name: '', email: '', password: '' };
        
        error.response.data.errors.forEach(err => {
          if (err.field in newErrors) {
            newErrors[err.field] = err.message;
          }
        });
        
        setErrors(newErrors);
        
      } else {
        // Manejar otros errores
        setFormError(error.message || 'Error en el registro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Crear Cuenta</h2>
      
      {formError && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label className="block text-gray-300 mb-1">Nombre Completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${
              errors.name ? 'border-red-500' : 'border-slate-600'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            placeholder="Tu nombre"
          />
          {errors.name && (
            <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
          )}
        </div>
        
        {/* Campo Email */}
        <div>
          <label className="block text-gray-300 mb-1">Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${
              errors.email ? 'border-red-500' : 'border-slate-600'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
          )}
        </div>
        
        {/* Campo Contraseña */}
        <div>
          <label className="block text-gray-300 mb-1">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-700 border ${
              errors.password ? 'border-red-500' : 'border-slate-600'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-red-400 text-sm">{errors.password}</p>
          )}
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-cyan-600 hover:bg-cyan-700'
          } text-white font-medium`}
        >
          {isLoading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;