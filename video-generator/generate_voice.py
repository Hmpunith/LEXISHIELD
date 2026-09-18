import asyncio
import os
import json
import edge_tts
from mutagen.mp3 import MP3

VOICE = "en-US-ChristopherNeural"

SCRIPT = {
    "scene1": "Welcome to LexiShield, an AI-powered legal risk intelligence and contract navigation platform. Legal agreements are notoriously dense, one-sided, and inaccessible to non-lawyers. LexiShield bridges this asymmetry.",
    "scene2": "Users can paste or upload any agreement. Today, we test a high-risk Freelance Software Agreement. LexiShield splits the text into categorized provisions and maps each against recognized market benchmark standards.",
    "scene3": "Our dual-stage audit engine evaluates each clause against established standards like ABA model terms. Notice how Section 4 detects an uncapped, unilateral indemnification, flagging it as a Critical Legal Trap.",
    "scene4": "Instead of leaving users defenseless, LexiShield generates ready-to-send counter-draft proposals complete with legal justifications you can directly copy into negotiation emails.",
    "scene5": "With Document Counsel, users can ask complex questions grounded directly in the contract. Notice how our AI extracts exact clause citations, giving users confidence and clarity.",
    "scene6": "Finally, the Compliance Checklist tracks crucial deadlines, while the Attorney Brief Kit arms users with high-value questions for legal counsel, cutting billable hours. Informational intelligence, empowering everyone."
}

async def generate_narration():
    os.makedirs("assets", exist_ok=True)
    durations = {}
    print("[VoiceGen] Generating high-fidelity neural narration with edge-tts...")
    
    for scene, text in SCRIPT.items():
        out_path = f"assets/{scene}.mp3"
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(out_path)
        audio = MP3(out_path)
        durations[scene] = int(audio.info.length * 1000)
        print(f"Generated {scene} ({durations[scene]} ms)")
        
    with open("assets/timings.json", "w") as f:
        json.dump(durations, f, indent=2)
        
    print("[VoiceGen] All scenes rendered successfully with exact timing metadata.")

if __name__ == "__main__":
    asyncio.run(generate_narration())
