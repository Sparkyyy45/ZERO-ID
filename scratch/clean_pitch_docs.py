import os
import re

pitch_dir = r"c:\Users\suyas\OneDrive\Desktop\PrivaKYC-main\zeroid-v2\pitch"

def clean_file(filepath, replacements):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Cleaned {os.path.basename(filepath)}")

# 1. 04_JUDGE_QNA_DEFENSE_PLAYBOOK.md
qna_path = os.path.join(pitch_dir, "04_JUDGE_QNA_DEFENSE_PLAYBOOK.md")
qna_replacements = [
    ("$3$-element group proof ($\\pi \\in G_1 \\times G_2 \\times G_1$)", "3-element group proof (π ∈ G₁ × G₂ × G₁)"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta)$$>", "```\n  >    e(A, B) = e(α, β) · e(L, γ) · e(C, δ)\n  >    ```"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta)$$ >", "```\n  >    e(A, B) = e(α, β) · e(L, γ) · e(C, δ)\n  >    ```"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta)$$ \n", "```\n  >    e(A, B) = e(α, β) · e(L, γ) · e(C, δ)\n  >    ```\n"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta)$$ \r\n", "```\n  >    e(A, B) = e(α, β) · e(L, γ) · e(C, δ)\n  >    ```\r\n"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta)$$", "e(A, B) = e(α, β) · e(L, γ) · e(C, δ)"),
    ("($KZG$)", "(KZG polynomial commitments)"),
    ("parameter $\\tau$", "parameter τ (tau)"),
    ("$2^{28}$", "2^28 (268 million)"),
    ("$s \\in \\mathbb{F}_p$", "s ∈ F_p"),
    ("$\\tau = (\\alpha, \\beta, \\gamma, \\delta)$", "τ = (α, β, γ, δ)"),
    ("$$\\text{Nullifier} = \\text{Poseidon}(\\text{Aadhaar\\_Secret\\_Salt}, \\text{UID\\_Hash}, \\text{RelyingParty\\_ID})$$", "Nullifier = Poseidon(Aadhaar_Secret_Salt, UID_Hash, RelyingParty_ID)"),
    ("$|T_{\\text{current}} - T| \\le 300\\text{s}$", "|T_current - T| ≤ 300 seconds"),
    ("($18$)", "(18)"),
    ("$$\\text{calculatedAge} = \\text{currentYear} - \\text{birthYear}$$", "calculatedAge = currentYear - birthYear"),
    ("$\\text{calculatedAge}$", "calculatedAge"),
    ("$$\\text{isOverAge} \\cdot (1 - \\text{isOverAge}) = 0 \\quad \\land \\quad \\text{isOverAge} === 1$$", "isOverAge · (1 - isOverAge) == 0  AND  isOverAge === 1"),
    ("$$S^e \\not\\equiv H(M) \\pmod N$$", "S^e ≠ H(M) mod N"),
    ("points $A \\in G_1$ (64 bytes), $B \\in G_2$ (128 bytes), and $C \\in G_1$ (64 bytes)", "points A ∈ G₁ (64 bytes), B ∈ G₂ (128 bytes), and C ∈ G₁ (64 bytes)"),
    ("$$L = IC_0 + \\sum_{i=1}^l x_i \\cdot IC_i$$", "L = IC₀ + Σ(xᵢ · ICᵢ)"),
    ("$$e(-A, B) \\cdot e(\\alpha, \\beta) \\cdot e(L, \\gamma) \\cdot e(C, \\delta) \\stackrel{?}{=} 1 \\in \\mathbb{G}_T$$", "e(-A, B) · e(α, β) · e(L, γ) · e(C, δ) == 1 ∈ G_T"),
    ("$\\mathbb{G}_T$", "G_T (target field)"),
    ("$0.0025\\text{ ALGO} + (0.0004\\text{ ALGO} \\times 33\\text{ bytes}) \\approx 0.0157\\text{ ALGO}$", "0.0025 ALGO + (0.0004 ALGO × 33 bytes) ≈ 0.0157 ALGO"),
    ("($S(x) \\approx_c \\Pi$)", "(Zero-Knowledge Simulator S(x) computationally indistinguishable from real proof Π)"),
    ("$r, s \\in_R \\mathbb{F}_r$", "r, s ∈ F_r (randomly sampled field blinding factors)"),
    ("$$A = \\alpha + \\sum a_i(x) + r\\delta, \\quad B = \\beta + \\sum b_i(x) + s\\delta, \\quad C = \\dots$$", "A = α + Σ aᵢ(x) + rδ,   B = β + Σ bᵢ(x) + sδ,   C = ..."),
    ("$O(1)$", "O(1)"),
    ("₹2 - ₹5 ($0.02 - $0.06)", "₹2 – ₹5 ($0.02 – $0.06 USD)"),
    ("₹15 - ₹30 ($0.20 - $0.40)", "₹15 – ₹30 ($0.20 – $0.40 USD)"),
    ("($25k - $50k/year)", "($25,000 – $50,000 USD/year)"),
]
clean_file(qna_path, qna_replacements)

# 2. 03_TECHNICAL_ARCHITECTURE_DEEP_DIVE.md
arch_path = os.path.join(pitch_dir, "03_TECHNICAL_ARCHITECTURE_DEEP_DIVE.md")
arch_replacements = [
    ("1 point in $G_1$, 1 point in $G_2$, 1 point in $G_1$", "1 point in G₁, 1 point in G₂, 1 point in G₁"),
    ("$\\pi = (A \\in G_1, B \\in G_2, C \\in G_1)$", "π = (A ∈ G₁, B ∈ G₂, C ∈ G₁)"),
    ("$(\\alpha, \\beta, \\gamma, \\delta, IC)$", "(α, β, γ, δ, IC)"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(IC_0 + \\sum_{i=1}^l x_i IC_i, \gamma) \\cdot e(C, \\delta)$$", "```\ne(A, B) = e(α, β) · e(IC₀ + Σ(xᵢ · ICᵢ), γ) · e(C, δ)\n```"),
    ("$$e(A, B) = e(\\alpha, \\beta) \\cdot e(IC_0 + \\sum_{i=1}^l x_i IC_i, \\gamma) \\cdot e(C, \\delta)$$", "```\ne(A, B) = e(α, β) · e(IC₀ + Σ(xᵢ · ICᵢ), γ) · e(C, δ)\n```"),
    ("$$\\text{Challenge} = H(\\text{Groth16\\_Proof} \\ || \\ \\text{Timestamp} \\ || \\ \\text{RelyingParty\\_ID})$$", "```\nChallenge = SHA256(Groth16_Proof || Timestamp || RelyingParty_ID)\n```"),
    ("$$\\text{Nullifier} = \\text{Poseidon}(\\text{Aadhaar\\_Secret\\_Salt}, \\text{UID\\_Hash})$$", "```\nNullifier = Poseidon(Aadhaar_Secret_Salt, UID_Hash)\n```"),
    ("$(r, s)$", "(r, s)"),
]
clean_file(arch_path, arch_replacements)

# 3. README.md in pitch
readme_path = os.path.join(pitch_dir, "README.md")
readme_replacements = [
    ("$A \\in G_1, B \\in G_2, C \\in G_1$", "A ∈ G₁, B ∈ G₂, C ∈ G₁"),
]
clean_file(readme_path, readme_replacements)

print("All pitch documents updated with clean, readable math notation.")
