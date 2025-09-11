import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const ApplicationPage = () => {
	return (
		<div className="min-h-screen bg-white">
			{/* Navbar */}
			<Navbar activeKey="app" />

			{/* Hero */}
			<section className="relative overflow-hidden">
				{/* Background band (light grey to subtle orange) */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#F2F3F5] via-white to-white" />
				<div className="absolute inset-x-0 top-[46%] h-40 bg-gradient-to-b from-transparent via-orange-200/60 to-transparent" />

				<div className="relative max-w-[1200px] mx-auto px-4 pt-10 md:pt-14 pb-16 md:pb-24">
					{/* Big headline behind phones */}
					<h1 className="text-black text-[13vw] leading-[0.95] font-extrabold tracking-tight text-center select-none [text-wrap:balance] md:text-[140px]">
						<span className="block">ODC Certif</span>
						<span className="block">Pour Étudiants</span>
					</h1>

					{/* Phones composition */}
					<div className="pointer-events-none relative">
						<div className="mx-auto w-[900px] max-w-full aspect-[3/2] relative -mt-10 md:-mt-14">
							{/* Back phone */}
							<img
								src="/students/smartphone.png"
								alt="ODC Certif app - phone"
								className="absolute left-[18%] top-[12%] w-[46%] rotate-[-22deg] drop-shadow-2xl"
								draggable="false"
							/>
							{/* Front phone */}
							<img
								src="/students/smartphone.png"
								alt="ODC Certif app - phone"
								className="absolute right-[14%] top-0 w-[48%] rotate-[18deg] drop-shadow-2xl"
								draggable="false"
							/>
                            
						</div>
					</div>
                    {/* Subtitle */}
					<p className="max-w-3xl mx-auto text-center mt-6 md:mt-2 text-[15px] md:text-[16px] leading-7 text-black/90">
						Découvrez l’application ODC Certif, votre espace personnel pour suivre vos formations, récupérer vos certificats, accéder aux documents partagés, donner votre avis… et bien plus encore !
					</p>

				</div>
			</section>

					{/* Features grid with 4 iPhone screenshots */}
					<section className="relative bg-white">
						<div className="max-w-[1200px] mx-auto px-4 py-16 md:py-24 space-y-20 md:space-y-28">
							{/* 1 - Inscription rapide aux formations (text left, phone right) */}
							<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
								<div>
									<h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">Inscription rapide aux formations</h3>
									<p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] max-w-[520px]">
										Consultez les formations disponibles dans votre établissement et inscrivez-vous en quelques secondes. Chaque session est accompagnée d’une fiche complète.
									</p>
								</div>
								<div className="relative flex justify-center md:justify-end">
									{/* Orange gradient circle + halftone */}
									<div className="absolute right-6 md:right-10 top-3 w-[340px] h-[340px] rounded-full bg-gradient-to-b from-orange-300 to-orange-400" />
									<svg className="absolute right-4 md:right-8 top-2 w-[360px] h-[360px] opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
										<defs>
											<radialGradient id="g1" r="70%">
												<stop offset="0%" stopColor="white" stopOpacity="0.7" />
												<stop offset="100%" stopColor="white" stopOpacity="0" />
											</radialGradient>
										</defs>
										<circle cx="100" cy="100" r="100" fill="url(#g1)" />
									</svg>
									{/* Swooshes */}
									<svg className="absolute right-0 top-0 w-[360px] h-[160px]" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 40 C 120 10, 240 10, 350 40" stroke="#F16E00" strokeWidth="10" strokeLinecap="round"/>
										<path d="M20 120 C 140 140, 260 120, 350 100" stroke="#F16E00" strokeWidth="10" strokeLinecap="round"/>
									</svg>
									{/* Phone image */}
									<img src="/students/iPhone.png" alt="ODC Certif - fiche formation" className="relative z-10 w-[280px] md:w-[300px] drop-shadow-xl" />
								</div>
							</div>

							{/* 2 - Parcours gamifié (phone left, text right) */}
							<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
								<div className="relative order-2 md:order-1 flex justify-center md:justify-start">
									<div className="absolute left-6 md:left-10 top-6 w-[360px] h-[360px] rounded-full bg-gradient-to-b from-orange-300 to-orange-400" />
									<svg className="absolute left-2 md:left-6 top-4 w-[360px] h-[360px] opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
										<defs>
											<radialGradient id="g2" r="70%">
												<stop offset="0%" stopColor="white" stopOpacity="0.7" />
												<stop offset="100%" stopColor="white" stopOpacity="0" />
											</radialGradient>
										</defs>
										<circle cx="100" cy="100" r="100" fill="url(#g2)" />
									</svg>
									<svg className="absolute left-0 bottom-4 w-[380px] h-[220px]" viewBox="0 0 380 220" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 180 C 120 120, 240 160, 360 210" stroke="#F16E00" strokeWidth="12" strokeLinecap="round"/>
									</svg>
									<img src="/students/Iphone2.png" alt="ODC Certif - profil gamifié" className="relative z-10 w-[280px] md:w-[300px] drop-shadow-xl" />
								</div>
								<div className="order-1 md:order-2">
									<h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">Parcours gamifié</h3>
									<p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] max-w-[520px]">
										Débloquez des badges en validant des formations et maintenez votre régularité grâce au système de streaks. Une manière motivante et ludique de rester engagé dans votre apprentissage.
									</p>
								</div>
							</div>

							{/* 3 - Chatbot d’assistance (text left, phone right) */}
							<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
								<div>
									<h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">Chatbot d’assistance</h3>
									<p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] max-w-[520px]">
										Posez vos questions directement à notre assistant intelligent. Il est disponible 24h/24 pour vous guider dans l’utilisation de l’application.
									</p>
								</div>
								<div className="relative flex justify-center md:justify-end">
									<div className="absolute right-6 md:right-10 top-6 w-[360px] h-[360px] rounded-full bg-gradient-to-b from-orange-300 to-orange-400" />
									<svg className="absolute right-2 md:right-6 top-4 w-[360px] h-[360px] opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
										<defs>
											<radialGradient id="g3" r="70%">
												<stop offset="0%" stopColor="white" stopOpacity="0.7" />
												<stop offset="100%" stopColor="white" stopOpacity="0" />
											</radialGradient>
										</defs>
										<circle cx="100" cy="100" r="100" fill="url(#g3)" />
									</svg>
									<svg className="absolute right-0 bottom-2 w-[360px] h-[160px]" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 120 C 160 160, 260 150, 350 120" stroke="#F16E00" strokeWidth="12" strokeLinecap="round"/>
									</svg>
									<img src="/students/iPhone3.png" alt="ODC Certif - assistant Cee" className="relative z-10 w-[280px] md:w-[300px] drop-shadow-xl" />
								</div>
							</div>

							{/* 4 - Certificats & feedback (phone left, text right) */}
							<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
								<div className="relative order-2 md:order-1 flex justify-center md:justify-start">
									<div className="absolute left-6 md:left-10 top-6 w-[360px] h-[360px] rounded-full bg-gradient-to-b from-orange-300 to-orange-400" />
									<svg className="absolute left-2 md:left-6 top-4 w-[360px] h-[360px] opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
										<defs>
											<radialGradient id="g4" r="70%">
												<stop offset="0%" stopColor="white" stopOpacity="0.7" />
												<stop offset="100%" stopColor="white" stopOpacity="0" />
											</radialGradient>
										</defs>
										<circle cx="100" cy="100" r="100" fill="url(#g4)" />
									</svg>
									<svg className="absolute left-0 bottom-2 w-[380px] h-[200px]" viewBox="0 0 380 200" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 150 C 160 140, 240 150, 360 180" stroke="#F16E00" strokeWidth="12" strokeLinecap="round"/>
									</svg>
									<img src="/students/iPhone4.png" alt="ODC Certif - certificats" className="relative z-10 w-[280px] md:w-[300px] drop-shadow-xl" />
								</div>
								<div className="order-1 md:order-2">
									<h3 className="text-2xl md:text-3xl font-extrabold text-black mb-3">Certificats & feedback</h3>
									<p className="text-[14px] md:text-[15px] leading-6 text-[#1f1f1f] max-w-[520px]">
										Téléchargez vos certificats dès la fin de chaque session validée. Donnez également votre avis pour aider à améliorer les futures formations.
									</p>
								</div>
							</div>
						</div>
					</section>

						

							{/* CTA: formation en poche */}
							<section className="relative overflow-hidden">
								{/* Orange background band */}
								<div className="absolute inset-x-0 top-10 md:top-16 h-[476px] bg-[#F16E00]" />

								<div className="relative max-w-[1200px] mx-auto px-4">
									<div className="grid grid-cols-1 md:grid-cols-2 items-end md:items-center gap-6">
										{/* Left copy inside the orange band */}
										<div className="pt-40 md:pt-48 pb-16 md:pb-20 pr-4 text-white z-10">
											<h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
												ODC Certif, votre
												<br /> formation en poche.
											</h2>
											<p className="text-[14px] md:text-[15px] leading-6 max-w-[620px] mb-6">
												Accédez facilement aux formations disponibles, Parler avec votre formateur, consultez vos documents partagés, récupérez vos certificats et suivez votre progression… le tout depuis votre mobile !
											</p>
											<div className="flex flex-wrap items-center gap-3">
												<a href="#" aria-label="Download on the App Store">
													<img src="/students/app_store.png" alt="App Store" className="h-12 w-auto" />
												</a>
												<a href="#" aria-label="Get it on Google Play">
													<img src="/students/play_store.png" alt="Google Play" className="h-12 w-auto" />
												</a>
											</div>
										</div>

										{/* Right image: hand with phone */}
										<div className="relative h-[520px] md:h-[540px] z-10">
															<img
												src="/students/smartphone_hand.png"
												alt="Téléchargez ODC Certif"
																className="absolute right-[-40px] md:right-[-80px] bottom-[-60px] md:bottom-[-120px] w-[320px] md:w-[480px] max-w-none drop-shadow-2xl select-none"
												draggable="false"
											/>
										</div>
									</div>
								</div>
							</section>
							{/* Testimonials */}
						<section className="relative bg-[#F2F3F5]">
							<div className="max-w-[1200px] mx-auto px-4 py-16 md:py-24">
								<h2 className="text-3xl md:text-5xl font-extrabold text-black text-center mb-3">Ce qu’ils en pensent</h2>
								<p className="text-center max-w-3xl mx-auto text-[15px] md:text-[16px] leading-7 text-black/70">
									Découvrez ce que les étudiants pensent de la plateforme et comment elle les accompagne dans leur parcours de formation.
								</p>

								<div className="mt-10 md:mt-14">
									<img
										src="/students/reviews.png"
										alt="Avis des étudiants ODC Certif"
										className="w-full h-auto rounded-xl shadow-lg"
									/>
								</div>
							</div>
						</section>	

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default ApplicationPage;

