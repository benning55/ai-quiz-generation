"""
Canadian Leaders Knowledge Check Service
Generates personalized questions about current Canadian leaders based on user's province/territory
"""
import random
from typing import Dict, List, Optional
from datetime import datetime

class CanadianLeadersQuiz:
    """Service for generating personalized Canadian leaders knowledge checks"""
    
    # NOTE: In production, these should be fetched from a live API or web scraping
    # LAST UPDATED: September 2025 - UPDATE REGULARLY
    # Data verified via official government sources as of September 2025
    CURRENT_LEADERS = {
        "head_of_state": {
            "name": "King Charles III",
            "title": "King of Canada",
            "since": "2022"
        },
        "prime_minister": {
            "name": "Mark Carney",
            "title": "Prime Minister of Canada",
            "party": "Liberal Party",
            "since": "March 14, 2025"
        },
        "governor_general": {
            "name": "Mary Simon",
            "title": "Governor General of Canada",
            "since": "July 26, 2021",
            "note": "First Indigenous Governor General"
        }
    }
    
    # Lieutenant Governors and Commissioners by Province/Territory
    # ⚠️ WARNING: These positions change frequently (typically every 5 years)
    # LAST VERIFIED: October 2024 (NOT September 2025)
    # TODO: Verify all provincial/territorial leaders against current official sources
    # Recommended sources: 
    # - https://www.gg.ca/ (for Lieutenant Governors)
    # - Individual province/territory government websites
    PROVINCIAL_LEADERS = {
        "AB": {
            "name": "Alberta",
            "leader": "Salma Lakhani",
            "title": "Lieutenant Governor",
            "since": "2020",
            "note": "First Muslim Lieutenant Governor in Canada"
        },
        "BC": {
            "name": "British Columbia",
            "leader": "Janet Austin",
            "title": "Lieutenant Governor",
            "since": "2018",
            "note": "Social policy advocate"
        },
        "MB": {
            "name": "Manitoba",
            "leader": "Anita Neville",
            "title": "Lieutenant Governor",
            "since": "2022",
            "note": "Former Member of Parliament"
        },
        "NB": {
            "name": "New Brunswick",
            "leader": "Brenda Murphy",
            "title": "Lieutenant Governor",
            "since": "2019",
            "note": "Community development leader"
        },
        "NL": {
            "name": "Newfoundland and Labrador",
            "leader": "Judy Foote",
            "title": "Lieutenant Governor",
            "since": "2018",
            "note": "Former federal cabinet minister"
        },
        "NS": {
            "name": "Nova Scotia",
            "leader": "Arthur J. LeBlanc",
            "title": "Lieutenant Governor",
            "since": "2017",
            "note": "Acadian community leader"
        },
        "ON": {
            "name": "Ontario",
            "leader": "Edith Dumont",
            "title": "Lieutenant Governor",
            "since": "2023",
            "note": "First Franco-Ontarian Lieutenant Governor"
        },
        "PE": {
            "name": "Prince Edward Island",
            "leader": "Antoinette Perry",
            "title": "Lieutenant Governor",
            "since": "2017",
            "note": "Mi'kmaq leader and educator"
        },
        "QC": {
            "name": "Quebec",
            "leader": "Manon Jeannotte",
            "title": "Lieutenant Governor",
            "since": "2023",
            "note": "Business and community leader"
        },
        "SK": {
            "name": "Saskatchewan",
            "leader": "Russ Mirasty",
            "title": "Lieutenant Governor",
            "since": "2019",
            "note": "First Indigenous Lieutenant Governor of Saskatchewan"
        },
        "NT": {
            "name": "Northwest Territories",
            "leader": "Margaret Thom",
            "title": "Commissioner",
            "since": "2017",
            "note": "Yellowknives Dene First Nation member"
        },
        "NU": {
            "name": "Nunavut",
            "leader": "Eva Aariak",
            "title": "Commissioner",
            "since": "2020",
            "note": "Former Premier of Nunavut"
        },
        "YT": {
            "name": "Yukon",
            "leader": "Angélique Bernard",
            "title": "Commissioner",
            "since": "2018",
            "note": "First woman and Indigenous Commissioner of Yukon"
        }
    }
    
    PROVINCES_TERRITORIES_LIST = [
        {"code": "AB", "name": "Alberta"},
        {"code": "BC", "name": "British Columbia"},
        {"code": "MB", "name": "Manitoba"},
        {"code": "NB", "name": "New Brunswick"},
        {"code": "NL", "name": "Newfoundland and Labrador"},
        {"code": "NS", "name": "Nova Scotia"},
        {"code": "ON", "name": "Ontario"},
        {"code": "PE", "name": "Prince Edward Island"},
        {"code": "QC", "name": "Quebec"},
        {"code": "SK", "name": "Saskatchewan"},
        {"code": "NT", "name": "Northwest Territories"},
        {"code": "NU", "name": "Nunavut"},
        {"code": "YT", "name": "Yukon"}
    ]
    
    @classmethod
    def get_federal_leaders_quiz(cls) -> List[Dict]:
        """Generate quiz questions about federal leaders"""
        questions = [
            {
                "question": "Who is the Head of State of Canada?",
                "type": "multiple_choice",
                "options": [
                    cls.CURRENT_LEADERS["head_of_state"]["name"],
                    "The Prime Minister",
                    "The Governor General",
                    "The Chief Justice"
                ],
                "answer": cls.CURRENT_LEADERS["head_of_state"]["name"],
                "explanation": f"{cls.CURRENT_LEADERS['head_of_state']['name']} is Canada's Head of State, serving as the monarch since {cls.CURRENT_LEADERS['head_of_state']['since']}."
            },
            {
                "question": "Who is the current Prime Minister of Canada?",
                "type": "multiple_choice",
                "options": [
                    cls.CURRENT_LEADERS["prime_minister"]["name"],
                    "Justin Trudeau",
                    "Stephen Harper",
                    "Jean Chrétien"
                ],
                "answer": cls.CURRENT_LEADERS["prime_minister"]["name"],
                "explanation": f"{cls.CURRENT_LEADERS['prime_minister']['name']} became Prime Minister on {cls.CURRENT_LEADERS['prime_minister']['since']}, succeeding Justin Trudeau."
            },
            {
                "question": f"Who is the current Governor General of Canada?",
                "type": "multiple_choice",
                "options": [
                    cls.CURRENT_LEADERS["governor_general"]["name"],
                    "Julie Payette",
                    "David Johnston",
                    "Michaëlle Jean"
                ],
                "answer": cls.CURRENT_LEADERS["governor_general"]["name"],
                "explanation": f"{cls.CURRENT_LEADERS['governor_general']['name']} has been Governor General since {cls.CURRENT_LEADERS['governor_general']['since']}. She is notable as the {cls.CURRENT_LEADERS['governor_general']['note']}."
            }
        ]
        
        # Shuffle options for each question
        for q in questions:
            if q["type"] == "multiple_choice":
                random.shuffle(q["options"])
        
        return questions
    
    @classmethod
    def get_provinces_territories_list(cls) -> List[Dict]:
        """Get list of provinces and territories"""
        return cls.PROVINCES_TERRITORIES_LIST
    
    @classmethod
    def generate_provincial_leader_question(cls, province_code: str) -> Optional[Dict]:
        """Generate a personalized question about the user's province/territory leader"""
        if province_code not in cls.PROVINCIAL_LEADERS:
            return None
        
        province_info = cls.PROVINCIAL_LEADERS[province_code]
        correct_leader = province_info["leader"]
        
        # Get other leaders as distractors (plausible but incorrect)
        other_leaders = [
            info["leader"] 
            for code, info in cls.PROVINCIAL_LEADERS.items() 
            if code != province_code
        ]
        random.shuffle(other_leaders)
        distractors = other_leaders[:2]  # Take 2 random others
        
        # Create options
        options = [correct_leader] + distractors
        random.shuffle(options)
        
        question = {
            "question": f"Who is the current {province_info['title']} of {province_info['name']}?",
            "type": "multiple_choice",
            "options": options,
            "answer": correct_leader,
            "explanation": f"{correct_leader} is the {province_info['title']} of {province_info['name']}, appointed in {province_info['since']}. {province_info['note']}.",
            "province": province_info["name"]
        }
        
        return question
    
    @classmethod
    def get_complete_leaders_check(cls, province_code: Optional[str] = None) -> Dict:
        """
        Get complete leaders knowledge check quiz
        Returns federal questions + optional provincial question
        """
        result = {
            "federal_leaders": cls.get_federal_leaders_quiz(),
            "provinces_territories": cls.get_provinces_territories_list(),
            "provincial_question": None
        }
        
        if province_code:
            result["provincial_question"] = cls.generate_provincial_leader_question(province_code)
        
        return result


# Singleton instance
leaders_quiz = CanadianLeadersQuiz()
