// ===== State =====
let currentMethod = 'type';
let cameraStream = null;
let capturedImage = null;
let uploadedFileContent = null;

// ===== Method Switching =====
function switchMethod(method) {
    currentMethod = method;
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.method-panel').forEach(panel => panel.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`method-${method}`).classList.add('active');
}

// ===== Summarization Engine =====
function summarizeText() {
    const text = document.getElementById('note-input').value.trim();
    if (!text) {
        alert('Please enter some text to summarize.');
        return;
    }
    
    const summary = extractiveSummarize(text);
    displaySummary(summary, text.split(/\s+/).length);
}

function extractiveSummarize(text, ratio = 0.3) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= 3) return text;
    
    // Word frequency scoring
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freqMap = {};
    words.forEach(word => {
        if (word.length > 3) {
            freqMap[word] = (freqMap[word] || 0) + 1;
        }
    });
    
    // Score sentences
    const scored = sentences.map(sentence => {
        const sWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        const score = sWords.reduce((sum, word) => sum + (freqMap[word] || 0), 0);
        return { sentence: sentence.trim(), score };
    });
    
    // Sort and pick top sentences
    const numSummary = Math.max(1, Math.floor(sentences.length * ratio));
    const topSentences = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, numSummary)
        .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));
    
    return topSentences.map(s => s.sentence).join(' ');
}

function displaySummary(summary, originalWords) {
    const output = document.getElementById('summary-output');
    const textDiv = document.getElementById('summary-text');
    const wordCount = document.getElementById('word-count');
    const compression = document.getElementById('compression-rate');
    
    textDiv.textContent = summary;
    const summaryWords = summary.split(/\s+/).length;
    const rate = Math.round((1 - summaryWords / originalWords) * 100);
    
    wordCount.textContent = `📝 ${summaryWords} words`;
    compression.textContent = `📉 ${rate}% shorter`;
    
    output.hidden = false;
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearText() {
    document.getElementById('note-input').value = '';
    document.getElementById('summary-output').hidden = true;
}

function copySummary() {
    const text = document.getElementById('summary-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Summary copied to clipboard!');
    });
}

// ===== File Upload =====
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
    const preview = document.getElementById('file-preview');
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;border-radius:8px;">`;
            preview.classList.add('active');
            uploadedFileContent = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        reader.onload = (e) => {
            preview.innerHTML = `<p>📄 ${file.name} (${(file.size/1024).toFixed(1)} KB)</p>`;
            preview.classList.add('active');
            uploadedFileContent = e.target.result;
        };
        reader.readAsText(file);
    }
}

function summarizeFile() {
    if (!uploadedFileContent) {
        alert('Please upload a file first.');
        return;
    }
    
    if (typeof uploadedFileContent === 'string' && uploadedFileContent.length > 100) {
        const summary = extractiveSummarize(uploadedFileContent);
        displaySummary(summary, uploadedFileContent.split(/\s+/).length);
    } else {
        alert('Image summarization requires OCR integration. For now, please type or upload text files.');
    }
}

// ===== Camera =====
async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.getElementById('camera-stream');
        video.srcObject = cameraStream;
        video.hidden = false;
        document.getElementById('camera-placeholder').hidden = true;
        document.getElementById('snap-btn').hidden = false;
    } catch (err) {
        alert('Could not access camera: ' + err.message);
    }
}

function takePhoto() {
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('photo-preview');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    capturedImage = canvas.toDataURL('image/jpeg');
    preview.innerHTML = `<img src="${capturedImage}" style="max-width:100%;border-radius:8px;">`;
    preview.classList.add('active');
    
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    video.hidden = true;
    document.getElementById('camera-placeholder').hidden = false;
    document.getElementById('snap-btn').hidden = true;
}

function summarizeImage() {
    if (!capturedImage) {
        alert('Please take a photo first.');
        return;
    }
    alert('Photo captured! For text extraction from images, integrate an OCR API like Tesseract.js or Google Vision API.');
}

// ===== SHS Notes =====
function switchLevel(level) {
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.level-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`level-${level}`).classList.add('active');
}

const topicData = {
    'physics-measurement': {
        title: 'Physical Quantities & Measurement',
        body: `
            <h4>Fundamental Quantities</h4>
            <p>These are quantities that cannot be defined in terms of other physical quantities. The seven SI base units are: length (meter, m), mass (kilogram, kg), time (second, s), electric current (ampere, A), temperature (kelvin, K), amount of substance (mole, mol), and luminous intensity (candela, cd).</p>
            <h4>Measurement Techniques</h4>
            <p>Always include units in measurements. Use vernier calipers for precision (0.01 cm) and micrometer screw gauges for higher precision (0.001 mm). Record measurements to the precision of the instrument.</p>
            <h4>Significant Figures</h4>
            <p>Rules: All non-zero digits are significant. Zeros between non-zero digits are significant. Leading zeros are not significant. Trailing zeros in a decimal number are significant.</p>
        `
    },
    'chemistry-atoms': {
        title: 'Atomic Structure',
        body: `
            <h4>Subatomic Particles</h4>
            <p>Protons (positive, in nucleus), neutrons (neutral, in nucleus), electrons (negative, orbit nucleus). Atomic number = protons. Mass number = protons + neutrons.</p>
            <h4>Electron Configuration</h4>
            <p>Electrons fill shells according to the 2n² rule (max 2, 8, 18, 32...). Use the aufbau principle: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p...</p>
            <h4>Isotopes</h4>
            <p>Atoms of the same element with different neutron numbers. Example: Carbon-12 and Carbon-14. Isotopes have identical chemical properties but different physical properties.</p>
        `
    },
    'biology-cells': {
        title: 'Cell Structure & Function',
        body: `
            <h4>Prokaryotic vs Eukaryotic</h4>
            <p>Prokaryotes (bacteria) lack membrane-bound nucleus and organelles. Eukaryotes (plants, animals, fungi, protists) have a true nucleus and membrane-bound organelles.</p>
            <h4>Cell Organelles</h4>
            <p>Nucleus: control center. Mitochondria: power house (aerobic respiration). Ribosomes: protein synthesis. Endoplasmic reticulum: transport. Golgi apparatus: packaging and secretion.</p>
            <h4>Cell Division</h4>
            <p>Mitosis: one division, 2 identical diploid cells (growth/repair). Meiosis: two divisions, 4 non-identical haploid cells (gametes). Stages: Prophase, Metaphase, Anaphase, Telophase.</p>
        `
    },
    'math-sets': {
        title: 'Sets & Operations',
        body: `
            <h4>Set Definitions</h4>
            <p>A set is a well-defined collection of distinct objects. Notation: A = {1, 2, 3} or B = {x : x is an even number}. Universal set (ξ) contains all elements under consideration.</p>
            <h4>Operations</h4>
            <p>Union (A ∪ B): all elements in A or B. Intersection (A ∩ B): elements in both A and B. Complement (A'): elements not in A. Difference (A - B): elements in A but not in B.</p>
            <h4>Venn Diagrams</h4>
            <p>Use circles to represent sets. Overlapping regions show intersections. Always label the universal set with a rectangle. Solve word problems by translating to set notation first.</p>
        `
    },
    'physics-dynamics': {
        title: "Newton's Laws of Motion",
        body: `
            <h4>First Law (Inertia)</h4>
            <p>An object remains at rest or in uniform motion unless acted upon by an external force. Inertia is the resistance to change in motion. Mass is a measure of inertia.</p>
            <h4>Second Law</h4>
            <p>F = ma. Force equals mass times acceleration. 1 Newton = 1 kg·m/s². The direction of acceleration is the same as the direction of the net force.</p>
            <h4>Third Law</h4>
            <p>For every action, there is an equal and opposite reaction. Action and reaction forces act on different bodies. Example: A book on a table exerts a force on the table; the table exerts an equal force upward on the book.</p>
        `
    },
    'chemistry-reactions': {
        title: 'Chemical Reactions & Equations',
        body: `
            <h4>Types of Reactions</h4>
            <p>Combination: A + B → AB. Decomposition: AB → A + B. Single displacement: A + BC → AC + B. Double displacement: AB + CD → AD + CB. Combustion: hydrocarbon + O₂ → CO₂ + H₂O.</p>
            <h4>Balancing Equations</h4>
            <p>Ensure atoms of each element are equal on both sides. Never change subscripts. Only adjust coefficients. Start with complex molecules first, then balance single elements last.</p>
            <h4>Energy Changes</h4>
            <p>Exothermic: releases heat (ΔH < 0). Endothermic: absorbs heat (ΔH > 0). Activation energy is the minimum energy required for a reaction to occur.</p>
        `
    },
    'biology-genetics': {
        title: 'Genetics & Inheritance',
        body: `
            <h4>Mendelian Genetics</h4>
            <p>Genes are units of heredity. Alleles are alternative forms of a gene. Dominant alleles mask recessive ones. Genotype = genetic makeup. Phenotype = observable trait.</p>
            <h4>Monohybrid Cross</h4>
            <p>Cross involving one trait. Use Punnett squares to predict offspring ratios. F₂ phenotypic ratio is typically 3:1 for complete dominance.</p>
            <h4>DNA Structure</h4>
            <p>Double helix composed of nucleotides. Each nucleotide has: phosphate group, deoxyribose sugar, nitrogenous base (A, T, G, C). Base pairing: A-T (2 hydrogen bonds), G-C (3 hydrogen bonds).</p>
        `
    },
    'math-calculus': {
        title: 'Introduction to Calculus',
        body: `
            <h4>Limits</h4>
            <p>The value a function approaches as the input approaches some value. Notation: lim(x→a) f(x). Important limits: lim(x→0) sin(x)/x = 1, lim(x→0) (1+x)^(1/x) = e.</p>
            <h4>Differentiation</h4>
            <p>The derivative f'(x) gives the instantaneous rate of change. Power rule: d/dx(xⁿ) = nxⁿ⁻¹. Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x).</p>
            <h4>Integration</h4>
            <p>The reverse of differentiation. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (for n ≠ -1). Definite integrals calculate area under curves between limits.</p>
        `
    },
    'physics-electromagnetism': {
        title: 'Electromagnetism',
        body: `
            <h4>Electric Circuits</h4>
            <p>Ohm's Law: V = IR. Series circuits: R_total = R₁ + R₂ + ... Parallel circuits: 1/R_total = 1/R₁ + 1/R₂ + ... Kirchhoff's Laws: Junction rule (current in = current out), Loop rule (sum of voltages = 0).</p>
            <h4>Magnetic Fields</h4>
            <p>Magnetic field lines emerge from North pole and enter South pole. Right-hand rule for solenoids: thumb points to North when fingers curl in current direction.</p>
            <h4>Electromagnetic Induction</h4>
            <p>Faraday's Law: induced EMF = -dΦ/dt. Lenz's Law: induced current opposes the change causing it. Transformers work on mutual induction: Vₛ/Vₚ = Nₛ/Nₚ.</p>
        `
    },
    'chemistry-organic': {
        title: 'Organic Chemistry',
        body: `
            <h4>Hydrocarbons</h4>
            <p>Alkanes (CₙH₂ₙ₊₂, single bonds, saturated), Alkenes (CₙH₂ₙ, double bond), Alkynes (CₙH₂ₙ₋₂, triple bond). Homologous series differ by CH₂ unit.</p>
            <h4>Functional Groups</h4>
            <p>Alcohol (-OH), Aldehyde (-CHO), Ketone (C=O), Carboxylic acid (-COOH), Ester (-COO-), Amine (-NH₂). Functional groups determine chemical properties.</p>
            <h4>Reaction Mechanisms</h4>
            <p>Substitution: atom/group replaced by another. Addition: atoms added across double/triple bond. Elimination: removal of atoms to form double bond. Polymerization: small units (monomers) join to form large molecules (polymers).</p>
        `
    },
    'biology-physiology': {
        title: 'Human Physiology',
        body: `
            <h4>Circulatory System</h4>
            <p>Heart has four chambers: right atrium, right ventricle, left atrium, left ventricle. Pulmonary circulation (heart → lungs → heart). Systemic circulation (heart → body → heart). Blood components: plasma (55%), red blood cells, white blood cells, platelets.</p>
            <h4>Nervous System</h4>
            <p>CNS (brain and spinal cord) and PNS (nerves). Neuron structure: dendrites, cell body, axon, synaptic terminals. Synapse: gap between neurons where neurotransmitters cross.</p>
            <h4>Homeostasis</h4>
            <p>Maintenance of constant internal environment. Negative feedback: response opposes stimulus. Examples: temperature regulation (hypothalamus), blood glucose (insulin/glucagon), water balance (ADH).</p>
        `
    },
    'math-mechanics': {
        title: 'Mechanics',
        body: `
            <h4>Kinematics in 2D</h4>
            <p>Projectile motion: horizontal velocity is constant, vertical has acceleration g. Range R = (u²sin2θ)/g. Maximum height H = (u²sin²θ)/2g.</p>
            <h4>Forces & Equilibrium</h4>
            <p>Resolution: split forces into perpendicular components. Moment = Force × perpendicular distance. Conditions for equilibrium: ΣF = 0 and ΣM = 0.</p>
            <h4>Work, Energy, Power</h4>
            <p>Work = Force × displacement × cosθ. KE = ½mv². PE = mgh. Conservation of energy: total mechanical energy remains constant in absence of non-conservative forces. Power = Work/time = F·v.</p>
        `
    }
};

function showTopic(subject, topic) {
    const key = `${subject}-${topic}`;
    const data = topicData[key];
    const viewer = document.getElementById('topic-viewer');
    
    if (data) {
        document.getElementById('topic-title').textContent = data.title;
        document.getElementById('topic-body').innerHTML = data.body;
        viewer.hidden = false;
        viewer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function closeTopic() {
    document.getElementById('topic-viewer').hidden = true;
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ===== Parallax Effect on Mouse Move =====
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        orb.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${1 + index * 0.05})`;
    });
});