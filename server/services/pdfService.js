// services/pdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a professional PDF training plan
 * @param {Object} trainingPlan - Generated training plan from AI
 * @param {Object} catalogueInfo - Catalogue information
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateTrainingPlanPDF = async (trainingPlan, catalogueInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const orangeColor = '#FF6600';
      const darkGray = '#333333';
      const lightGray = '#666666';

      // Header with Orange branding
      doc.rect(0, 0, 595, 80).fill(orangeColor);
      
      doc.fillColor('#FFFFFF')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('PLAN DE FORMATION', 50, 30);

      // Catalogue Title
      doc.fillColor(darkGray)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(catalogueInfo.title, 50, 100);

      // Metadata
      let yPosition = 140;
      doc.fontSize(10)
         .font('Helvetica');

      if (catalogueInfo.level) {
        doc.fillColor(lightGray).text('Niveau: ', 50, yPosition, { continued: true });
        doc.fillColor(darkGray).text(catalogueInfo.level);
        yPosition += 20;
      }

      if (catalogueInfo.type) {
        doc.fillColor(lightGray).text('Type: ', 50, yPosition, { continued: true });
        doc.fillColor(darkGray).text(catalogueInfo.type);
        yPosition += 20;
      }

      if (catalogueInfo.technologies && catalogueInfo.technologies.length > 0) {
        doc.fillColor(lightGray).text('Technologies: ', 50, yPosition, { continued: true });
        doc.fillColor(darkGray).text(catalogueInfo.technologies.join(', '));
        yPosition += 20;
      }

      yPosition += 20;

      // Description Section
      addSection(doc, 'DESCRIPTION', yPosition);
      yPosition += 30;
      doc.fontSize(10)
         .fillColor(darkGray)
         .font('Helvetica')
         .text(trainingPlan.description, 50, yPosition, {
           width: 495,
           align: 'justify'
         });
      yPosition = doc.y + 25;

      // Check if we need a new page
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      // Objectives Section
      addSection(doc, 'OBJECTIFS PÉDAGOGIQUES', yPosition);
      yPosition += 30;
      trainingPlan.objectives.forEach((objective, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text(`${index + 1}. `, 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .text(objective, { width: 480 });
        yPosition = doc.y + 8;
      });
      yPosition += 15;

      // Target Audience
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'PUBLIC CIBLE', yPosition);
      yPosition += 30;
      doc.fontSize(10)
         .fillColor(darkGray)
         .text(trainingPlan.targetAudience, 50, yPosition, {
           width: 495,
           align: 'justify'
         });
      yPosition = doc.y + 25;

      // Prerequisites
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'PRÉREQUIS', yPosition);
      yPosition += 30;
      trainingPlan.detailedPrerequisites.forEach((prereq, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text('• ', 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .text(prereq, { width: 480 });
        yPosition = doc.y + 8;
      });
      yPosition += 15;

      // Program Modules
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'PROGRAMME DÉTAILLÉ', yPosition);
      yPosition += 30;

      trainingPlan.modules.forEach((module, moduleIndex) => {
        if (yPosition > 600) {
          doc.addPage();
          yPosition = 50;
        }

        // Module title with background
        doc.rect(45, yPosition - 5, 505, 25).fill('#F5F5F5');
        doc.fontSize(12)
           .fillColor(orangeColor)
           .font('Helvetica-Bold')
           .text(`Module ${moduleIndex + 1}: ${module.title}`, 50, yPosition);
        yPosition += 30;

        // Duration
        doc.fontSize(9)
           .fillColor(lightGray)
           .font('Helvetica-Oblique')
           .text(`Durée: ${module.duration}`, 50, yPosition);
        yPosition += 20;

        // Module objectives
        doc.fontSize(10)
           .fillColor(darkGray)
           .font('Helvetica-Bold')
           .text('Objectifs:', 50, yPosition);
        yPosition += 15;
        module.objectives.forEach(obj => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(9)
             .fillColor(darkGray)
             .font('Helvetica')
             .text('◦ ' + obj, 60, yPosition, { width: 480 });
          yPosition = doc.y + 6;
        });
        yPosition += 10;

        // Module content
        doc.fontSize(10)
           .fillColor(darkGray)
           .font('Helvetica-Bold')
           .text('Contenu:', 50, yPosition);
        yPosition += 15;
        module.content.forEach(item => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(9)
             .fillColor(darkGray)
             .font('Helvetica')
             .text('• ' + item, 60, yPosition, { width: 480 });
          yPosition = doc.y + 6;
        });
        yPosition += 10;

        // Practical exercises
        if (module.practicalExercises && module.practicalExercises.length > 0) {
          doc.fontSize(10)
             .fillColor(darkGray)
             .font('Helvetica-Bold')
             .text('Exercices pratiques:', 50, yPosition);
          yPosition += 15;
          module.practicalExercises.forEach(exercise => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }
            doc.fontSize(9)
               .fillColor(orangeColor)
               .font('Helvetica')
               .text('✓ ' + exercise, 60, yPosition, { width: 480 });
            yPosition = doc.y + 6;
          });
        }
        yPosition += 20;
      });

      // Teaching Methods
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'MÉTHODES PÉDAGOGIQUES', yPosition);
      yPosition += 30;
      trainingPlan.teachingMethods.forEach(method => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text('• ', 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .text(method);
        yPosition = doc.y + 8;
      });
      yPosition += 15;

      // Evaluation Methods
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'MODALITÉS D\'ÉVALUATION', yPosition);
      yPosition += 30;
      trainingPlan.evaluationMethods.forEach(method => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text('• ', 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .text(method);
        yPosition = doc.y + 8;
      });
      yPosition += 15;

      // Resources
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'RESSOURCES ET OUTILS', yPosition);
      yPosition += 30;
      trainingPlan.resources.forEach(resource => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text('• ', 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .text(resource);
        yPosition = doc.y + 8;
      });
      yPosition += 15;

      // Skills Acquired
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      addSection(doc, 'COMPÉTENCES ACQUISES', yPosition);
      yPosition += 30;
      trainingPlan.skillsAcquired.forEach(skill => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10)
           .fillColor(orangeColor)
           .text('✓ ', 50, yPosition, { continued: true })
           .fillColor(darkGray)
           .font('Helvetica-Bold')
           .text(skill);
        yPosition = doc.y + 8;
      });
      yPosition += 25;

      // Total Duration Box
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.rect(50, yPosition, 495, 40).fillAndStroke('#FFF5E6', orangeColor);
      doc.fontSize(12)
         .fillColor(orangeColor)
         .font('Helvetica-Bold')
         .text(`Durée totale de la formation: ${trainingPlan.totalDuration}`, 60, yPosition + 12);

      // Footer - Add to all pages
      const range = doc.bufferedPageRange();
      const totalPages = range.start + range.count;
      
      for (let i = range.start; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor(lightGray)
           .text(
             'Document généré automatiquement par ODC Certification Platform',
             50,
             doc.page.height - 40,
             { align: 'center', width: 495 }
           );
        doc.text(
          `Page ${i + 1} / ${totalPages}`,
          50,
          doc.page.height - 25,
          { align: 'center', width: 495 }
        );
      }

      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

/**
 * Helper function to add section title
 */
function addSection(doc, title, yPosition) {
  doc.fontSize(14)
     .fillColor('#FF6600')
     .font('Helvetica-Bold')
     .text(title, 50, yPosition);
  
  // Underline
  doc.moveTo(50, yPosition + 18)
     .lineTo(200, yPosition + 18)
     .strokeColor('#FF6600')
     .lineWidth(2)
     .stroke();
}

module.exports = {
  generateTrainingPlanPDF
};
