import pandas as pd
import numpy as np
import mysql.connector
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Conexión a MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="agua_potable"
)

# Cargar datos filtrando facturas pagadas con monto > 100
df = pd.read_sql("""
    SELECT id, cedula, monto, estado, mes_pago, anio_pago
    FROM invoices
    WHERE estado = 'pagada' AND monto > 100
""", conn)

if df.empty:
    print("No hay datos suficientes para entrenar el modelo.")
else:
    # Crear columna de fecha a partir de mes y año
    df['fecha'] = pd.to_datetime(df['anio_pago'].astype(str) + '-' + df['mes_pago'].astype(str) + '-01')
    df = df.sort_values(by=['cedula', 'fecha'])

    # Escalar el monto
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[['monto']])

    # Entrenar modelo de aislamiento
    model = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = model.fit_predict(X_scaled)
    df['anomaly'] = df['anomaly'].map({1: 0, -1: 1})

    # Borrar anomalías anteriores
    cursor = conn.cursor()
    cursor.execute("DELETE FROM anomalies")

    # Insertar nuevas anomalías
    for _, row in df[df['anomaly'] == 1].iterrows():
        cursor.execute("""
            INSERT INTO anomalies (cedula, monto, mes_pago, anio_pago, motivo)
            VALUES (%s, %s, %s, %s, %s)
        """, (row['cedula'], row['monto'], row['mes_pago'], row['anio_pago'], 'Monto mayor a 100 y detectado como anómalo'))

    conn.commit()
    cursor.close()
    print(f"✅ {df['anomaly'].sum()} anomalías detectadas e insertadas.")

conn.close()
