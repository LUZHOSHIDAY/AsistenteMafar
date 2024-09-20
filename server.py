import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
import os
import random  # Importa el módulo random

# Configura la clave de la API de generative AI de Google   
genai.configure(api_key="AIzaSyC8l6uIm5sX2PSXLxItRzEMXoTLV4ZDjgw")

class GeminiApp:
    def __init__(self):  
        pass

    def generate_gemini_response(self, prompt):
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 50,
            "max_output_tokens": 512,
        }

        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        model = genai.GenerativeModel(model_name="gemini-pro", generation_config=generation_config, safety_settings=safety_settings)

        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Ocurrió un error: {str(e)}")
            return None

    def process_request(self, text):
        # Verifica si la consulta está relacionada con el contacto
        if "contacto"in text.lower() or "contact" in text.lower():
            # Lista de analistas con sus datos de contacto
            analysts = [
                {
                    "name": "Alonso Ylla Santa Cruz",
                    "email": "alonsodosantos87@gmail.com",
                    "whatsapp": "https://wa.me/qr/AILTR6JORLQIH1"
                },
                {
                    "name": "Fredy Ayme Quiro",
                    "email": "fredyayme83@gmail.com",
                    "whatsapp": "https://wa.me/qr/LXLU3UCZWGBYM1"
                },
                {
                    "name": "Arnold Mamani Paredes",
                    "email": "arnoldmamaniparedess@gmail.com",
                    "whatsapp": "https://wa.me/qr/OZTZQWZUBQZBB1"
                }
            ]

            # Selecciona aleatoriamente un analista
            analyst = random.choice(analysts)

            # Construye el mensaje de contacto
            return (f"Para recibir asistencia financiera personalizada, puedes contactar a uno de nuestros analistas:\n\n"
                    f"- {analyst['name']}: {analyst['email']}\n"
                    f"  WhatsApp. {analyst['whatsapp']}\n\n"
                    "O visita nuestra página web: MAFARconsultasfinancieras.com")
        prompt = f"""
        Eres MAFAR TECH Innovation, un asistente virtual especializado en finanzas, creado por LKTA. 
        Somos un grupo de desarrollo en finanzas ubicado en San Sebastián, 4to paradero, referencia al costado del Instituto Khipu.

        Tu propósito es ayudar a los usuarios con temas financieros de manera eficiente y clara.

        Debes proporcionar respuestas cortas y concisas sobre temas como inversiones, ahorro, impuestos, 
        planificación financiera, tasas de interés, y cualquier consulta relacionada con finanzas.

        Usa un tono profesional pero accesible. Evita proporcionar información personal y mantén la privacidad de los usuarios.

        Si los usuarios necesitan más información, pueden contactarnos a través de nuestra página web: 
        <a href='https://mafarfinanzas.com'>mafarfinanzas.com</a> o por correo electrónico: 
        <a href='mailto:mafarfinanzas@gmail.com'>mafarfinanzas@gmail.com</a>.

        Responde a la siguiente consulta financiera de manera breve y sin formateo adicional:
        Pregunta: "{text}"
        """

    
        response = self.generate_gemini_response(prompt)
    
        if response:
            return response.strip()  # Asegúrate de eliminar espacios innecesarios
        else:
            return "No se pudo generar una respuesta en este momento."

app = Flask(__name__)
gemini_app = GeminiApp()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.form['question']
    response = gemini_app.process_request(user_input)
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True)
