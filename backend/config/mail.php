<?php
/**
 * Configuración para enviar correos usando EmailJS vía API REST.
 * 
 * INSTRUCCIONES:
 * 1. Crea una cuenta en EmailJS (https://www.emailjs.com)
 * 2. Agrega un Email Service (ej. Gmail) y copia su "Service ID".
 * 3. Crea dos plantillas (Templates) en EmailJS:
 *    - Plantilla A (Aviso al Admin): usa {{nombre}}, {{email}}, {{asunto}}, {{mensaje}}
 *    - Plantilla B (Respuesta a cliente): usa {{nombreCliente}}, {{respuesta}}
 * 4. Obtén tu Public Key (en Account > General).
 * 5. Reemplaza los valores de abajo.
 */

return [
    'EMAILJS_SERVICE_ID'  => 'service_vfqvxxz', // ID del servicio (ej. 'service_xxxxx')
    'EMAILJS_PUBLIC_KEY'  => 'bxAoKxrQmNLU5NT5x', // Tu Public Key
    'EMAILJS_ACCESS_TOKEN' => 'xXyB6i9CJ3V_s-LuSHNBQ', // Tu Access Token (Account > Security)
    
    // IDs de Plantillas (Templates)
    'EMAILJS_TEMPLATE_ADMIN'    => '', // Nueva consulta de contacto (para ti)
    'EMAILJS_TEMPLATE_CLIENTE'  => '', // Respuesta a consulta (para el cliente)
    'EMAILJS_TEMPLATE_RESERVA'  => 'template_1ty003q', // Pago confirmado (para el cliente)
    'EMAILJS_TEMPLATE_BIENVENIDA' => 'template_8d19rwm', // Bienvenida al registrarse (para el cliente)
    'EMAILJS_TEMPLATE_ADMIN_RESERVA' => '', // Aviso de nueva reserva creada (para ti)
    
    // Correo administrador (donde recibirás las notificaciones)
    'MAIL_ADMIN' => 'mvsyntaxsolutions@gmail.com',
];
