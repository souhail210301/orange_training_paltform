import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <Navbar activeKey="about" />

            {/* Hero Section */}
            <div className="relative h-[380px] bg-black overflow-hidden">
                {/* Background image */}
                <img
                    src="/students/people.png"
                    alt="Team ODC Certif"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                {/* Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
                    <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-wide">À Propos</h1>
                    <h2 className="text-5xl md:text-6xl font-extrabold text-orange-500 tracking-wider">ODC Certif</h2>
                </div>
            </div>

            {/* Mission Section */}
            <section className="relative">
                {/* Decorative orange line (top) */}
                <svg
                    className="absolute -top-10 left-0 w-full pointer-events-none"
                    viewBox="0 0 1440 260"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-6 104 C 230 18 530 -24 860 78 C 1135 168 1330 168 1420 104 C 1580 -12 1610 226 1200 226 C 1030 226 940 188 760 146 C 580 104 410 122 260 156"
                        stroke="#F9A25B"
                        strokeWidth="14"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>

                <div className="relative z-10 max-w-[1200px] mx-auto px-4 py-16 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div>
                            <h3 className="text-4xl md:text-5xl font-extrabold leading-tight text-black">
                                La Mission
                                <br /> d’ODC Certif
                            </h3>
                        </div>
                        <div>
                            <p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f]">
                                ODC Certif est une plateforme développée par Orange Digital Center dans le but de faciliter la gestion des formations certifiantes au sein des universités partenaires.
                                Notre mission est de simplifier la coordination entre les établissements et les formateurs, tout en garantissant une expérience fluide et professionnelle pour toutes les parties prenantes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who we are section */}
            <section className="relative pb-16 md:pb-24 overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-3">Qui Sommes-Nous?</h3>
                    <p className="max-w-3xl text-[14px] md:text-[15px] leading-6 text-[#1f1f1f]">
                        Le programme Orange Digital Center a été lancé en Tunisie en 2019 dont le but est d’accompagner et former les jeunes tunisiens et les porteurs d’idées innovantes dans plusieurs domaines comme l’intelligence artificielle, la cybersécurité, le développement web et mobile, etc.
                    </p>

                    {/* Visual collage */}
                    <div className="relative mt-10 md:mt-12 flex justify-center">
                        {/* Orange radial circle */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-gradient-to-b from-orange-400 to-orange-300" />
                        {/* Dotted halftone (right) */}
                        <svg className="absolute right-10 bottom-10 w-56 h-56 opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="g" r="70%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <circle cx="100" cy="100" r="100" fill="url(#g)" />
                        </svg>

                        {/* People image (grayscale) */}
                        <img
                            src="/students/team.png"
                            alt="Etudiants ODC"
                            className="relative z-10 max-w-[720px] w-full h-auto object-contain filter grayscale"
                        />

                        {/* Orange swooshes overlay */}
                        <svg className="absolute z-20 top-10 w-[760px] h-[380px]" viewBox="0 0 760 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 60 C 220 10, 420 10, 740 60" stroke="#F16E00" strokeWidth="16" strokeLinecap="round"/>
                            <path d="M0 190 C 240 160, 480 160, 760 200" stroke="#F16E00" strokeWidth="16" strokeLinecap="round"/>
                            <path d="M10 320 C 250 350, 520 320, 750 300" stroke="#F16E00" strokeWidth="16" strokeLinecap="round"/>
                        </svg>
                    </div>
                </div>
            </section>

                        {/* Stats section */}
                        <section className="relative bg-gradient-to-r from-[#F16E00] to-[#E96500] text-white">
                            <div className="max-w-[1200px] mx-auto px-4 py-16 md:py-20">
                                <div className="text-center mb-10 md:mb-14">
                                    <h3 className="text-3xl md:text-5xl font-extrabold">Les chiffres qui comptent</h3>
                                    <p className="mt-4 max-w-3xl mx-auto text-[15px] md:text-[16px] leading-7 opacity-90">
                                        Notre engagement en faveur d’une intégration numérique renforcée guide nos efforts pour créer un impact durable sur la société.
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-stretch justify-center gap-10 md:gap-16">
                                    {/* 1 */}
                                    <div className="text-center min-w-[180px]">
                                        <div className="text-5xl md:text-7xl font-extrabold leading-none">765</div>
                                        <div className="mt-4 text-xl md:text-2xl leading-snug">Sessions<br/>Livrées</div>
                                    </div>
                                    <div className="hidden md:block w-px bg-white/60" />
                                    {/* 2 */}
                                    <div className="text-center min-w-[180px]">
                                        <div className="text-5xl md:text-7xl font-extrabold leading-none">12537</div>
                                        <div className="mt-4 text-xl md:text-2xl leading-snug">Étudiants<br/>Formés</div>
                                    </div>
                                    <div className="hidden md:block w-px bg-white/60" />
                                    {/* 3 */}
                                    <div className="text-center min-w-[180px]">
                                        <div className="text-5xl md:text-7xl font-extrabold leading-none">48</div>
                                        <div className="mt-4 text-xl md:text-2xl leading-snug">Universités<br/>Partenaires</div>
                                    </div>
                                    <div className="hidden md:block w-px bg-white/60" />
                                    {/* 4 */}
                                    <div className="text-center min-w-[180px]">
                                        <div className="text-5xl md:text-7xl font-extrabold leading-none">28</div>
                                        <div className="mt-4 text-xl md:text-2xl leading-snug">Formations<br/>disponibles</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Why ODC Certif section */}
                        <section className="relative bg-white">
                            <div className="max-w-[1200px] mx-auto px-4 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                                {/* Left copy */}
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Pourquoi ODC Certif?</h3>
                                    <p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] mb-6">
                                        La gestion manuelle des sessions, des présences et des certifications peut rapidement devenir chronophage et source d’erreurs.
                                        C’est pour répondre à ces enjeux qu’Orange Digital Center a conçu ODC Certif, une plateforme numérique intuitive qui permet aux établissements partenaires de gérer leurs formations de manière centralisée, rapide et transparente.
                                    </p>
                                    <h4 className="font-semibold text-[16px] md:text-[17px] mb-3">ODC Certif s’adresse à :</h4>
                                    <ul className="list-disc pl-6 space-y-2 text-[14px] md:text-[15px] text-[#1f1f1f]">
                                        <li>Aux universités qui souhaitent organiser des formations avec Orange Digital Center.</li>
                                        <li>Aux étudiants bénéficiaires des formations certifiantes</li>
                                        <li>À l’équipe ODC, pour assurer le bon déroulement</li>
                                    </ul>
                                </div>

                                {/* Right visual: laptop with orange circle and swooshes */}
                                <div className="relative flex items-center justify-center">
                                    {/* Orange circle */}
                                    <div className="absolute w-[420px] h-[420px] rounded-full bg-orange-300/90" />
                                    {/* Shadow ellipse */}
                                    <div className="absolute -bottom-6 w-[460px] h-[80px] bg-black/20 blur-2xl rounded-full" />
                                    {/* Laptop image */}
                                    <img src="/students/laptop.png" alt="ODC Certif Laptop" className="relative z-10 w-[520px] max-w-full h-auto" />
                                    {/* Swooshes */}
                                    <svg className="absolute z-20 w-[560px] h-[360px]" viewBox="0 0 560 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 100 C 180 70, 360 70, 550 110" stroke="#F16E00" strokeWidth="14" strokeLinecap="round"/>
                                        <path d="M-10 200 C 160 230, 360 200, 560 220" stroke="#F16E00" strokeWidth="14" strokeLinecap="round"/>
                                        <path d="M40 300 C 220 330, 420 300, 520 280" stroke="#F16E00" strokeWidth="14" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                        </section>
                        {/* Join network CTA with Tunisia line on the left */}
                        <section className="relative bg-white">
                            <div className="max-w-[1200px] mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                                {/* Left: Tunisia orange line illustration */}
                                <div className="flex justify-center md:justify-start">
                                    <img
                                        src="/students/tunisia_line.png"
                                        alt="Tunisie - ligne décorative"
                                        className="w-[550px] max-w-full h-auto object-contain select-none"
                                        draggable="false"
                                    />
                                </div>

                                {/* Right: Copy and CTA */}
                                <div className="max-w-xl md:ml-6">
                                    <h3 className="text-3xl md:text-4xl font-extrabold text-black leading-tight mb-4">
                                        Rejoignez notre réseau et
                                        <br /> devenez partenaire
                                    </h3>
                                    <p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] mb-6">
                                        Bénéficiez de formations gratuites proposées par Orange Digital Center, et accédez à un espace dédié pour planifier, suivre et certifier vos sessions.
                                    </p>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 bg-[#F16E00] hover:brightness-95 text-white font-medium rounded-md px-5 h-10"
                                    >
                                        Demander Accès
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Optional bottom wave line */}
                            <svg className="absolute bottom-0 left-0 w-full translate-y-1" viewBox="0 0 1440 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 100 C 200 20, 400 20, 600 100 C 800 180, 1040 180, 1240 100 C 1340 60, 1440 60, 1440 60" stroke="#F16E00" strokeWidth="8" fill="none" />
                            </svg>
                        </section>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AboutPage;