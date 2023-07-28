from flask import Flask, render_template, jsonify, request
import pandas as pd
from sqlalchemy import create_engine

app = Flask(__name__)

db_username = 'postgres'
db_password = 'postgres'
db_host = 'localhost'
db_port = '5432'
db_name = 'weather_hazards_db'

def get_data(selected_state, selected_hazard):
    engine = create_engine(f'postgresql://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}')

    query = 'SELECT "COUNTY", "STATE", "TRND_EVNTS", "HRCN_EVNTS", "HAIL_EVNTS" FROM hazard_data'
    data = pd.read_sql(query, engine)

    if selected_state:
        data = data[data['STATE'] == selected_state]

    if selected_hazard == 'Hail':
        data = data[['COUNTY', 'STATE', 'HAIL_EVNTS']]
    elif selected_hazard == 'Tornado':
        data = data[['COUNTY', 'STATE', 'TRND_EVNTS']]
    elif selected_hazard == 'Hurricane':
        data = data[['COUNTY', 'STATE', 'HRCN_EVNTS']]
    else:
        return []

    records = data.to_dict(orient='records')
    return records

@app.route('/events')
def index():
    engine = create_engine(f'postgresql://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}')
    query = 'SELECT DISTINCT "STATE" FROM hazard_data ORDER BY "STATE"'
    states_df = pd.read_sql(query, engine)
    states = states_df['STATE'].tolist()

    return render_template('barchartboston.html', states=states)


@app.route('/boston',methods = ['GET'])
def login():
    selected_state = request.args.get('selected_state')
    selected_hazard = request.args.get('selected_hazard')
    data = get_data(selected_state, selected_hazard)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
