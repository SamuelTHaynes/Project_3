from flask import Flask, render_template, jsonify, request
import pandas as pd
from sqlalchemy import create_engine
import json
import psycopg2
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

@app.route('/')
def intro():
    return render_template('intro.html')


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


# Load json data into api endpoint
@app.route('/geojson_data')
def geojson_data():
    with open("updated_geojson_data3.json", "r") as file:
        geojson_data = json.load(file)
        return jsonify(geojson_data)
    
# End point for geojson mapping
@app.route('/geojson')
def geojson():
        return render_template("json_map.html")

# table route
@app.route('/csv')
def clean_data():
    clean_df = pd.read_csv("Hazard_Data.csv")
    htmltable = clean_df.to_html(classes='table', index=False, header=True, table_id='dataTable')
    return render_template("table.html", table=htmltable)

# plotting pie chart 
@app.route('/chartjs')
def chartjs():
    return render_template("chartjs.html")

# loading csv data 
@app.route('/pie_chart/<state>')
def pie_chart(state):
    pie_chart = pd.read_csv("pie_chart.csv")
    return jsonify(pie_chart[pie_chart['STATE'] == state].to_dict())

@app.route('/bar_loss')
def load_index():
    return render_template('index.html')


    
if __name__ == '__main__':
    app.run(debug=True)