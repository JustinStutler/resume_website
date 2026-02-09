# server/context_loader.py
import os

# Define the descriptions here (since they are metadata, not content)
CHUNK_METADATA = {
    "resume": "Justin Stutler's professional resume, including education, skills, work experience, and student organizations.",
    "sop": "Justin Stutler's Statement of Purpose, detailing his academic and professional journey, motivations for pursuing AI, and future goals.",
    "gre_scores": "Justin Stutler's GRE General Test scores, including Verbal Reasoning, Quantitative Reasoning, and Analytical Writing sections.",
    "courses": "A comprehensive list of courses Justin Stutler has taken, including AP credits, courses from University of North Georgia, Kennesaw State University, and University of South Florida.",
    "personal_background": "General personal background information about Justin Stutler, including age, high school, interests, and summary of academic achievements.",
    "tell_me_about": "A concise summary about Justin Stutler, his skills, and aspirations. Good for a general overview."
}

def load_context_chunks():
    """
    Reads text files from the 'content' directory and builds the context dictionary.
    Returns: dict
    """
    base_path = os.path.dirname(os.path.abspath(__file__))
    content_dir = os.path.join(base_path, 'content')
    
    chunks = {}

    for key, description in CHUNK_METADATA.items():
        file_path = os.path.join(content_dir, f"{key}.txt")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            chunks[key] = {
                "description": description,
                "content": content
            }
        except FileNotFoundError:
            print(f"WARNING: Content file not found: {file_path}")
            # Fallback to avoid crashing if a file is missing
            chunks[key] = {
                "description": description,
                "content": "[Content not available]"
            }

    return chunks

# Load once when module is imported
CONTEXT_CHUNKS = load_context_chunks()