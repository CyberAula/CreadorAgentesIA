<h1 align="center" style="font-weight: bold">
  Creador Agentes IA
  <br>
    <h3 align="center">Plataforma para crear GPT personalizadas mediante la api Assistant y usarlos en experimentos educativos (sin necesidad de programar)</h3>
  <br>
  
</h1>

**Creador Agentes IA** proporciona una solución fácil de usar para configurar rápidamente un GPT personalizado y realizar experimentos de educación.



https://github.com/SamurAIGPT/Open-Custom-GPT/assets/4326215/c41a7b62-f5c9-458c-be40-5ec6788b7726


## Características principales 🎯

- **Rápido y eficaz**: Diseñado con la velocidad y la eficiencia en su núcleo. Open Custom GPT asegura una rápida velocidad de construcción de un GPT.
- **Seguro**: Sus datos, su control. Siempre. Autoalojado y nunca compartido con otros.
- **Código abierto**: Código abierto y de uso gratuito.
- **Compartir**: Compartir/Embed su proyecto con sus usuarios directamente y dar acceso a su información.

### Stack tecnológico

- Next.js
- OpenAI (en el futuro Gemini, Mistral, Llama3, ...)
- Tailwind
- MongoDB

### Correr el proyecto localmente

Requisitos mínimos para ejecutar los proyectos localmente

- Node.js v18
- OpenAI API Key

```shell
npm install

npm run build

npm run dev

# visit http://localhost:3003/{basePath}
```

## Integración con postMessage 🔗

Este proyecto incluye funcionalidad de `postMessage` para integrar el chatbot en iframes y comunicarse con la página padre.

Ejemplo en `prueba_iframe_send_postmessage.html`

### Eventos Disponibles

El chatbot iframe envía los siguientes eventos a la página padre:

#### 1. `iframe_loaded`
Se envía cuando el iframe se carga completamente.

```javascript
{
    type: 'iframe_loaded',
    data: {
        assistantId: 'asst_xxx',
        assistantName: 'Nombre del Asistente',
        userEmail: 'user@example.com'
    },
    source: 'chatbot-iframe',
    assistantId: 'asst_xxx'
}
```

#### 2. `chat_created`
Se envía cuando se crea una nueva conversación.

```javascript
{
    type: 'chat_created',
    data: {
        threadId: 'thread_xxx',
        userEmail: 'user@example.com',
        assistantId: 'asst_xxx'
    },
    source: 'chatbot-iframe',
    assistantId: 'asst_xxx'
}
```

#### 3. `message_sent`
Se envía cuando el usuario envía un mensaje.

```javascript
{
    type: 'message_sent',
    data: {
        message: 'Texto del mensaje',
        userEmail: 'user@example.com',
        threadId: 'thread_xxx'
    },
    source: 'chatbot-iframe',
    assistantId: 'asst_xxx'
}
```

#### 4. `response_received`
Se envía cuando se recibe una respuesta del asistente.

```javascript
{
    type: 'response_received',
    data: {
        response: 'Respuesta del asistente',
        userEmail: 'user@example.com',
        threadId: 'thread_xxx',
        runId: 'run_xxx'
    },
    source: 'chatbot-iframe',
    assistantId: 'asst_xxx'
}
```

#### 5. `error`
Se envía cuando ocurre un error.

```javascript
{
    type: 'error',
    data: {
        error: 'Descripción del error',
        assistantId: 'asst_xxx'
    },
    source: 'chatbot-iframe',
    assistantId: 'asst_xxx'
}
```

### Implementación en la Página Padre

#### HTML
```html
<div class="chatbot-container">
    <iframe src="http://localhost:3000/agentes/embed/asst_1JwbfrSBdE9IfTRYxxFmY8YQ?assistant_name=CustomName"></iframe>            
</div>
```

#### JavaScript
```javascript
// Escuchar mensajes del iframe
window.addEventListener('message', function(event) {
    // Verificar que el mensaje viene de nuestro chatbot
    if (event.data.source === 'chatbot-iframe') {
        const { type, data } = event.data;
        
        switch(type) {
            case 'iframe_loaded':
                console.log('Chatbot cargado:', data);
                break;
                
            case 'chat_created':
                console.log('Chat creado:', data);
                break;
                
            case 'message_sent':
                console.log('Mensaje enviado:', data);
                // Aquí puedes hacer tracking, analytics, etc.
                break;
                
            case 'response_received':
                console.log('Respuesta recibida:', data);
                // Aquí puedes hacer tracking, analytics, etc.
                break;
                
            case 'error':
                console.error('Error del chatbot:', data);
                break;
        }
    }
});
```

### Casos de Uso

#### 1. Analytics y Tracking
```javascript
case 'message_sent':
    // Enviar evento a Google Analytics
    gtag('event', 'chat_message_sent', {
        assistant_id: data.assistantId,
        user_email: data.userEmail
    });
    break;
```

#### 2. Actualizar UI de la Página Padre
```javascript
case 'response_received':
    // Mostrar notificación
    showNotification('Nueva respuesta del asistente');
    break;
```

#### 3. Sincronización de Estado
```javascript
case 'chat_created':
    // Guardar threadId en localStorage
    localStorage.setItem('chatbot_thread', data.threadId);
    break;
```

#### 4. Manejo de Errores
```javascript
case 'error':
    // Mostrar mensaje de error al usuario
    showErrorMessage(data.error);
    break;
```

### Seguridad

- Los mensajes incluyen un campo `source: 'chatbot-iframe'` para verificar el origen
- Siempre verifica el origen del mensaje antes de procesarlo
- Usa el dominio específico en lugar de `'*'` en producción

### Notas Importantes

1. El iframe debe estar en el mismo dominio o configurado con CORS apropiado
2. Los eventos se envían solo cuando el iframe está embebido (window.parent !== window)
3. El `assistantId` se incluye en todos los mensajes para identificación
4. Los mensajes se envían en tiempo real durante la conversación

## Licencia 📄

Este proyecto tiene licencia MIT - [LICENCIA](LICENSE)

## Referencias

<h4 align="center">Basado en el proyecto https://github.com/SamurAIGPT/Open-Custom-GPT</h4>
