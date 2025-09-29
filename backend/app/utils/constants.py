"""
Constants for Canadian Citizenship Test chapters and categories
"""

# Canadian Citizenship Test Chapters
CANADIAN_CHAPTERS = [
    {
        "title": "Rights and Responsibilities",
        "description": "Understanding the rights and responsibilities of Canadian citizens, including the Charter of Rights and Freedoms, voting rights, and civic duties.",
        "order": 1
    },
    {
        "title": "Who We Are", 
        "description": "Canada's identity, diversity, official languages, and the people who make up the Canadian nation.",
        "order": 2
    },
    {
        "title": "Canada History",
        "description": "Key events, figures, and periods in Canadian history from Indigenous peoples to Confederation and beyond.",
        "order": 3
    },
    {
        "title": "Modern Canada",
        "description": "Contemporary Canada, including recent developments, current issues, and Canada's role in the world today.",
        "order": 4
    },
    {
        "title": "How Canadians Govern Themselves",
        "description": "The structure of Canadian government, including federal, provincial, and municipal levels of government.",
        "order": 5
    },
    {
        "title": "Canada Federal Elections",
        "description": "The electoral system, voting process, political parties, and how federal elections work in Canada.",
        "order": 6
    },
    {
        "title": "The Justice System",
        "description": "Canadian legal system, courts, laws, police, and the administration of justice in Canada.",
        "order": 7
    },
    {
        "title": "Canadian Symbols",
        "description": "National symbols, emblems, anthem, flag, and other important symbols that represent Canada.",
        "order": 8
    },
    {
        "title": "Canadian Economy",
        "description": "Canada's economic system, major industries, trade, natural resources, and economic development.",
        "order": 9
    },
    {
        "title": "Canadian Regions",
        "description": "Geography of Canada, provinces and territories, major cities, and regional characteristics.",
        "order": 10
    }
]

# Chapter title to ID mapping (will be populated after database initialization)
CHAPTER_MAPPING = {}

# Category mappings for backward compatibility
CHAPTER_CATEGORIES = {
    "rights": "Rights and Responsibilities",
    "identity": "Who We Are", 
    "history": "Canada History",
    "modern": "Modern Canada",
    "government": "How Canadians Govern Themselves",
    "elections": "Canada Federal Elections",
    "justice": "The Justice System",
    "symbols": "Canadian Symbols",
    "economy": "Canadian Economy",
    "geography": "Canadian Regions",
    "regions": "Canadian Regions"
}