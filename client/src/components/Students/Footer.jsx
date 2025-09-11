import React from 'react';

const Footer = () => {
	return (
		<footer className="bg-[#F16E00] text-white mt-20">
			{/* Top content */}
			<div className="max-w-[1200px] mx-auto px-4 py-12 md:py-16">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 items-start">
					{/* Logo */}
					<div className="flex items-start">
						<img
							src="/students/odc_certif_white_logo.png"
							alt="ODC Certif"
							className="h-16 md:h-20 w-auto select-none"
							draggable="false"
						/>
					</div>

				{/* Column: Orange */}
					<div>
						<h4 className="text-xl font-semibold mb-4">Orange</h4>
						<ul className="space-y-3 text-[15px]">
							<li><a href="#" className="hover:underline">Informations légales</a></li>
							<li><a href="#" className="hover:underline">Conditions générales</a></li>
							<li><a href="#" className="hover:underline">Orange Developer Center</a></li>
						</ul>
					</div>

					{/* Column: Réseaux Sociaux */}
					<div>
						<h4 className="text-xl font-semibold mb-4">Réseaux Sociaux</h4>
						<ul className="space-y-3 text-[15px]">
							<li><a href="#" className="hover:underline">Facebook</a></li>
							<li><a href="#" className="hover:underline">Instagram</a></li>
							<li><a href="#" className="hover:underline">LinkedIn</a></li>
							<li><a href="#" className="hover:underline">Github</a></li>
							<li><a href="#" className="hover:underline">Youtube</a></li>
						</ul>
					</div>

					{/* Column: Navigation */}
					<div>
						<h4 className="text-xl font-semibold mb-4">Navigation</h4>
						<ul className="space-y-3 text-[15px]">
							<li><a href="#" className="hover:underline">Page d’accueil</a></li>
							<li><a href="#" className="hover:underline">Qui-sommes nous?</a></li>
							<li><a href="#" className="hover:underline">Le Dashboard</a></li>
							<li><a href="#" className="hover:underline">L’application</a></li>
						</ul>
					</div>
				</div>

				{/* Download row */}
				<div className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
					<p className="text-lg">Télécharger l’application <span className="font-semibold">ODC Certif</span></p>
					<div className="flex items-center gap-4">
						<a href="#" aria-label="Download on the App Store">
							<img src="/students/app_store.png" alt="App Store" className="h-12 w-auto" />
						</a>
						<a href="#" aria-label="Get it on Google Play">
							<img src="/students/play_store.png" alt="Google Play" className="h-12 w-auto" />
						</a>
					</div>
				</div>

				{/* Divider */}
				<div className="mt-8 border-t border-white/40" />

				{/* Copyright */}
				<p className="text-center text-white/90 text-sm py-6">© 2025 Orange Digital Center</p>
			</div>
		</footer>
	);
};

export default Footer;

