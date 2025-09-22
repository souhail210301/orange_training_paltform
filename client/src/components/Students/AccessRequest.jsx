import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const AccessRequest = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '+216',
		function: '',
		university: '',
		address: '',
		message: ''
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Placeholder for submission (e.g., send email or API call)
		alert('Demande envoyée');
	};

	return (
		<div className="min-h-screen flex flex-col bg-[#F3F4F6]">
			<Navbar />

			{/* Hero header */}
			<div className="relative w-full">
				<img src="/students/header.png" alt="Header" className="w-full h-[260px] md:h-[500px] object-cover" />
				<div className="absolute bottom-0 left-0 right-0 h-4 bg-[#F16E00]"></div>
			</div>

					{/* Card form (styled per provided spec) */}
					<div className="w-full px-4 pb-16 -mt-12 md:-mt-16">
						<div className="relative bg-white rounded-[8px] shadow max-w-[1193px] w-full mx-auto">
							<div className="flex flex-col items-center px-6 py-10 md:p-[64px] lg:p-[96px] xl:p-[120px] 2xl:p-[160px]">
								{/* Header block */}
								<div className="w-full max-w-[809px] flex flex-col items-center gap-6 text-center" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
									<h1 className="font-bold" style={{ fontSize: '64px', lineHeight: '1', color: '#050505' }}>Votre espace vous attend !</h1>
									<p className="text-[#3F3F46]" style={{ fontSize: '24px', lineHeight: '1.2' }}>
										Complétez ce formulaire pour faire une demande d’accès à la plateforme ODC Certif et rejoindre notre réseau de partenaires.
									</p>
								</div>

								{/* Spacer per spec (128px) */}
								<div className="h-[64px] md:h-[96px] lg:h-[128px]" />

								{/* Form block */}
								<form onSubmit={handleSubmit} className="w-full max-w-[809px] flex flex-col gap-12">
									{/* Name */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Nom<span className="text-red-500">*</span></label>
										<input name="name" value={form.name} onChange={handleChange} placeholder="Votre Nom Ici"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* Email */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Adresse E-mail<span className="text-red-500">*</span></label>
										<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="nom@email.com"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* Phone */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Numéro de Téléphone<span className="text-red-500">*</span></label>
										<input name="phone" value={form.phone} onChange={handleChange} placeholder="+216"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* Function */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Fonction<span className="text-red-500">*</span></label>
										<input name="function" value={form.function} onChange={handleChange} placeholder="Votre Fonction"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* University */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Nom de l’établissement<span className="text-red-500">*</span></label>
										<input name="university" value={form.university} onChange={handleChange} placeholder="le nom de l’établissement"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* Address */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Adresse de l’établissement<span className="text-red-500">*</span></label>
										<input name="address" value={form.address} onChange={handleChange} placeholder="L’adresse de l’établissement"
													 className="w-full h-[60px] border rounded-[4px] px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
													 style={{ borderColor: '#E4E4E7' }} required />
									</div>

									{/* Message */}
									<div className="flex flex-col gap-4">
										<label className="font-medium" style={{ fontSize: '24px', lineHeight: '1.2', color: '#050505' }}>Message ou commentaires supplémentaires</label>
										<textarea name="message" value={form.message} onChange={handleChange} placeholder="..."
															className="w-full border rounded-[4px] px-4 py-3 h-[224px] resize-vertical focus:outline-none focus:ring-1 focus:ring-orange-500"
															style={{ borderColor: '#E4E4E7' }} />
									</div>

									{/* Submit */}
									<div className="w-full flex flex-col items-center">
										<button type="submit" className="w-full h-[61px] bg-[#F16E00] text-white rounded-[4px] font-medium" style={{ fontSize: '24px', lineHeight: '1.2' }}>
											Envoyer la demande
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>

			<Footer />
		</div>
	);
};

export default AccessRequest;
