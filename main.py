import os
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Database Models
class Participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participant.id'))
    first_flip = db.Column(db.String(10))  # 'heads' or 'tails'
    second_flip = db.Column(db.String(10))  # 'heads' or 'tails' or null
    submitted_answer = db.Column(db.String(10))  # 'yes' or 'no'
    true_answer = db.Column(db.String(10))  # 'yes' or 'no' or null
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# Create tables
with app.app_context():
    db.create_all()


# Routes
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/coin')
def coin():
    return render_template('coin.html')


@app.route('/api/response', methods=['POST'])
def save_response():
    data = request.json

    # Create participant
    participant = Participant()
    db.session.add(participant)
    db.session.commit()

    # Save response
    response = Response(participant_id=participant.id,
                        first_flip=data['first_flip'],
                        second_flip=data.get('second_flip'),
                        submitted_answer=data['submitted_answer'],
                        true_answer=data.get('true_answer'))
    db.session.add(response)
    db.session.commit()

    return jsonify({'status': 'success', 'id': response.id})


@app.route('/api/results', methods=['GET'])
def get_results():
    responses = Response.query.all()

    total = len(responses)
    yes_count = len([r for r in responses if r.submitted_answer == 'yes'])
    no_count = total - yes_count

    # Count true answers (from heads flips only)
    true_responses = [r for r in responses if r.first_flip == 'heads']
    true_yes = len([r for r in true_responses if r.true_answer == 'yes'])
    true_no = len(true_responses) - true_yes

    return jsonify({
        'total':
        total,
        'yes_percentage': (yes_count / total * 100) if total > 0 else 0,
        'no_percentage': (no_count / total * 100) if total > 0 else 0,
        'true_yes':
        true_yes,
        'true_no':
        true_no,
        'true_total':
        len(true_responses)
    })


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
