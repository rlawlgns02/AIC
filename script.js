document.addEventListener('DOMContentLoaded', () => {
    // --- 기존 데모 플랫폼 UI 스크립트 시작 ---
    const demoSteps = document.querySelectorAll('.demo-step-indicator');
    const demoPanes = document.querySelectorAll('.demo-pane');
    const nextStepButtons = document.querySelectorAll('.demo-pane .next-step-button');
    const prevStepButtons = document.querySelectorAll('.demo-pane .prev-step-button');

    const modelCards = document.querySelectorAll('.model-selection-grid .model-card');
    const dataOptionCards = document.querySelectorAll('.data-setup-options .data-option-card');
    const dataSourceContents = document.querySelectorAll('.data-source-content');
    const dataUploadInput = document.getElementById('data-upload-input');
    const uploadedFileNameDisplay = document.getElementById('uploaded-file-name');
    const recommendedDatasetsList = document.getElementById('recommended-datasets-list');

    const trainingSection = document.querySelector('.training-section');
    const deploymentSection = document.querySelector('.deployment-section');
    const trainingProgressBar = trainingSection ? trainingSection.querySelector('.training-progress-bar .progress') : null;
    const trainingStatus = trainingSection ? trainingSection.querySelector('#training-status') : null;
    const startTrainingButton = trainingSection ? trainingSection.querySelector('.start-training-button') : null;
    const retrainButton = deploymentSection ? deploymentSection.querySelector('.retrain-button') : null;

    const selectedModelNameDisplay = document.getElementById('selected-model-name');
    const finalModelNameDisplay = document.getElementById('final-model-name');
    const finalDataNameDisplay = document.getElementById('final-data-name');

    let currentStep = 1;
    let selectedModel = null;
    let selectedDataSource = 'upload';
    let selectedDataset = null;

    const recommendedDatasets = {
        'classification': [
            { name: '이미지넷 서브셋 (1000 클래스)', description: '다양한 사물 이미지 데이터' },
            { name: '한국어 뉴스 기사 카테고리 분류 데이터', description: '정치, 경제, 사회 등 뉴스 분류 데이터' },
            { name: '스팸 메일 분류 데이터셋', description: '정상/스팸 메일 텍스트 데이터' }
        ],
        'prediction': [
            { name: '과거 주식 시세 데이터 (가상)', description: '특정 종목의 과거 주가 및 거래량 데이터' },
            { name: '지역별 날씨 시계열 데이터', description: '과거 온도, 습도, 강수량 등 데이터' },
            { name: '온라인 쇼핑몰 판매 데이터 (수요 예측)', description: '일별/주별 상품 판매량 기록' }
        ],
        'dialogue': [
            { name: '챗봇 질의응답 데이터 (FAQ)', description: '자주 묻는 질문과 답변 쌍 데이터' },
            { name: '일상 대화 스크립트', description: '자유로운 대화체 텍스트 데이터' },
            { name: '고객 문의 기록 (텍스트)', description: '서비스 이용 관련 고객 문의 내역' }
        ],
         'clustering': [
            { name: '온라인 쇼핑몰 고객 구매 데이터', description: '고객별 구매 기록, 방문 패턴 등' },
            { name: '영화 추천 시스템 사용자 평점 데이터', description: '사용자의 영화 평점 및 시청 기록' },
            { name: '뉴스 기사 토픽 모델링용 데이터', description: '기사 텍스트를 주제별로 그룹화하기 위한 데이터' }
        ],
         'object-detection': [
            { name: 'COCO 데이터셋 (일부)', description: '다양한 객체가 라벨링된 이미지 데이터' },
            { name: '자율주행 차량 이미지 데이터', description: '도로, 차량, 보행자 등이 포함된 주행 환경 이미지' },
            { name: 'CCTV 감시 영상 샘플', description: '보안 및 모니터링을 위한 객체 감지 영상' }
        ],
         'generation': [
            { name: '유명인 얼굴 이미지 데이터셋 (CelebA)', description: '다양한 유명인 얼굴 이미지' },
            { name: '예술 작품 이미지 데이터', description: '유화, 수채화 등 다양한 스타일의 이미지' },
            { name: '소설/스토리 생성용 텍스트 데이터', description: '다양한 장르의 스토리 텍스트' }
        ]
    };

    function updateDemoUI() {
        demoSteps.forEach(indicator => {
            const step = parseInt(indicator.dataset.step);
            indicator.classList.toggle('active', step === currentStep);
        });

        demoPanes.forEach(pane => {
            const step = parseInt(pane.dataset.step);
            pane.classList.toggle('active', step === currentStep); 

            if (step === currentStep) {
                if (currentStep === 2) {
                    updateSelectedModelDisplay();
                    renderRecommendedDatasets();
                    updateDataSelectionUI();
                } else if (currentStep === 3) {
                    updateFinalSelectionDisplay();
                    resetTrainingProcessUI();
                }
            }
        });
        updateNavigationButtonStates();
    }

    function updateNavigationButtonStates() {
        demoPanes.forEach(pane => {
             const paneStep = parseInt(pane.dataset.step);
             const nextButton = pane.querySelector('.next-step-button');
             const prevButton = pane.querySelector('.prev-step-button');

             if (paneStep === currentStep) { 
                 if (nextButton) {
                     if (currentStep === 1) {
                        nextButton.disabled = !selectedModel;
                     } else if (currentStep === 2) {
                         let dataSelected = false;
                          if (selectedDataSource === 'upload' && selectedDataset && uploadedFileNameDisplay.textContent !== '') {
                              dataSelected = true;
                          } else if (selectedDataSource === 'recommended' && selectedDataset) {
                              dataSelected = true;
                          }
                         nextButton.disabled = !dataSelected;
                     }
                 }
                 if (prevButton) {
                     prevButton.disabled = currentStep <= 1;
                 }
             }
        });
    }

    function updateSelectedModelDisplay() {
         if (selectedModelNameDisplay && selectedModel) {
             const modelCardElement = document.querySelector(`.model-card[data-model="${selectedModel.type}"]`);
             const iconElement = modelCardElement ? modelCardElement.querySelector('.model-icon i') : null;
             const iconHtml = iconElement ? `<i class="${iconElement.className}" style="margin-right: 8px;"></i>` : '';
             selectedModelNameDisplay.innerHTML = `${iconHtml}${selectedModel.name}`;
         } else if (selectedModelNameDisplay) {
             selectedModelNameDisplay.textContent = '선택되지 않음';
         }
    }

     function updateFinalSelectionDisplay() {
         if (finalModelNameDisplay && selectedModel) {
             const modelCardElement = document.querySelector(`.model-card[data-model="${selectedModel.type}"]`);
             const iconElement = modelCardElement ? modelCardElement.querySelector('.model-icon i') : null;
             const iconHtml = iconElement ? `<i class="${iconElement.className}" style="margin-right: 8px;"></i>` : '';
             finalModelNameDisplay.innerHTML = `${iconHtml}${selectedModel.name}`;
         } else if (finalModelNameDisplay) {
             finalModelNameDisplay.textContent = '선택되지 않음';
         }

          if (finalDataNameDisplay && selectedDataset) {
             finalDataNameDisplay.textContent = typeof selectedDataset === 'string' ? selectedDataset : selectedDataset.name;
         } else if (finalDataNameDisplay) {
             finalDataNameDisplay.textContent = '선택되지 않음';
         }
     }

    function updateDataSelectionUI() {
         dataOptionCards.forEach(card => {
             const source = card.dataset.dataSource;
             const contentPane = document.querySelector(`.data-source-content[data-data-source="${source}"]`);
             card.classList.toggle('active', source === selectedDataSource);
             if (contentPane) contentPane.classList.toggle('active', source === selectedDataSource);
         });
         selectedDataset = null;
         if(uploadedFileNameDisplay) uploadedFileNameDisplay.textContent = '';
         if (recommendedDatasetsList) {
             recommendedDatasetsList.querySelectorAll('.dataset-item.selected').forEach(item => item.classList.remove('selected'));
         }
          if (selectedDataSource !== 'upload' && dataUploadInput) {
              dataUploadInput.value = '';
          }
         updateNavigationButtonStates();
    }

    function renderRecommendedDatasets() {
        if (recommendedDatasetsList && selectedModel && recommendedDatasets[selectedModel.type]) {
            const datasets = recommendedDatasets[selectedModel.type];
            recommendedDatasetsList.innerHTML = datasets.map(dataset =>
                `<div class="dataset-item" data-dataset-name="${dataset.name}">
                    <strong>${dataset.name}</strong><br>
                    <small>${dataset.description}</small>
                 </div>`
            ).join('');

            recommendedDatasetsList.querySelectorAll('.dataset-item').forEach(item => {
                item.addEventListener('click', () => {
                    recommendedDatasetsList.querySelectorAll('.dataset-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    selectedDataset = item.dataset.datasetName;
                    updateNavigationButtonStates();
                });
            });
        } else if (recommendedDatasetsList) {
            recommendedDatasetsList.innerHTML = '<p>선택된 모델 유형에 대한 추천 데이터셋이 없습니다.</p>';
             selectedDataset = null;
        }
         updateNavigationButtonStates();
    }

    function resetTrainingProcessUI() {
         if (trainingSection && deploymentSection && trainingProgressBar && trainingStatus && startTrainingButton) {
             trainingSection.style.display = 'block';
             deploymentSection.style.display = 'none';
             trainingProgressBar.style.width = '0%';
             trainingProgressBar.classList.remove('retraining');
             trainingStatus.textContent = '학습 준비 완료. "학습 시작" 버튼을 눌러주세요.';
             startTrainingButton.style.display = 'inline-block';
             startTrainingButton.disabled = false;
             if (retrainButton) retrainButton.style.display = 'none';
         }
    }

    function simulateTraining(isRetraining = false) {
        if (!trainingSection || !deploymentSection || !trainingProgressBar || !trainingStatus) {
            console.error("학습 UI 요소가 누락되어 시뮬레이션을 진행할 수 없습니다.");
            return;
        }
        deploymentSection.style.display = 'none';
        trainingSection.style.display = 'block';
        if (startTrainingButton) startTrainingButton.style.display = 'none';
         if (retrainButton) retrainButton.style.display = 'none';

        trainingProgressBar.style.width = '0%';
        trainingProgressBar.classList.toggle('retraining', isRetraining);

        if (trainingStatus) {
             trainingStatus.textContent = `${isRetraining ? '추가 ' : ''}학습 준비 중... 0%`;
        }

        let progress = 0;
        const trainingInterval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                if (trainingProgressBar) {
                     trainingProgressBar.style.width = progress + '%';
                }
                if (trainingStatus) {
                     if (progress < 100) {
                          trainingStatus.textContent = `${isRetraining ? '추가 ' : ''}학습 진행 중: ${progress}% 완료`;
                     } else {
                         trainingStatus.textContent = isRetraining ?
                             '추가학습 완료되었습니다.\n너무 과한 학습은 과적합 오류를 불러올수 있습니다.' :
                             '모델 학습 완료!';
                     }
                }
            } else {
                clearInterval(trainingInterval);
                trainingSection.style.display = 'none';
                deploymentSection.style.display = 'block';
                if (trainingProgressBar) trainingProgressBar.classList.remove('retraining');
                 if (retrainButton) retrainButton.style.display = 'inline-block';
            }
        }, 300);
    }

    modelCards.forEach(card => {
        card.addEventListener('click', () => {
            modelCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const modelName = card.querySelector('h4')?.textContent || '';
            const modelType = card.dataset.model || modelName;
            selectedModel = { name: modelName, type: modelType };
            selectedDataset = null;
            if (uploadedFileNameDisplay) uploadedFileNameDisplay.textContent = '';
            if (dataUploadInput) dataUploadInput.value = '';
             if (recommendedDatasetsList) {
                recommendedDatasetsList.querySelectorAll('.dataset-item.selected').forEach(item => item.classList.remove('selected'));
             }
            updateNavigationButtonStates();
        });
    });

    dataOptionCards.forEach(card => {
         card.addEventListener('click', () => {
             selectedDataSource = card.dataset.dataSource;
             updateDataSelectionUI();
         });
    });

     if (dataUploadInput && uploadedFileNameDisplay) {
         dataUploadInput.addEventListener('change', function() {
             if (this.files && this.files.length > 0) {
                 uploadedFileNameDisplay.textContent = `선택된 파일: ${this.files[0].name}`;
                 selectedDataset = this.files[0];
             } else {
                 uploadedFileNameDisplay.textContent = '';
                 selectedDataset = null;
             }
             updateNavigationButtonStates();
         });
     }

    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) {
                currentStep++;
                updateDemoUI();
            }
        });
    });

    prevStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) {
                currentStep--;
                updateDemoUI();
            }
        });
    });

     demoSteps.forEach(indicator => {
         indicator.addEventListener('click', () => {
             const targetStep = parseInt(indicator.dataset.step);
             if (targetStep === currentStep) return;

             if (targetStep < currentStep) {
                 currentStep = targetStep;
                 updateDemoUI();
             } else {
                 let canProceed = false;
                 if (currentStep === 1 && targetStep === 2 && selectedModel) {
                     canProceed = true;
                 } else if (currentStep === 2 && targetStep === 3) {
                      let dataSelected = false;
                      if (selectedDataSource === 'upload' && selectedDataset && uploadedFileNameDisplay.textContent !== '') {
                          dataSelected = true;
                      } else if (selectedDataSource === 'recommended' && selectedDataset) {
                          dataSelected = true;
                      }
                      if (dataSelected) canProceed = true;
                 }
                 if (canProceed) {
                     currentStep = targetStep;
                     updateDemoUI();
                 } else {
                     if (currentStep === 1) {
                         alert("다음 단계로 이동하려면 모델을 선택해야 합니다.");
                     } else if (currentStep === 2) {
                          alert("다음 단계로 이동하려면 학습에 사용할 데이터를 선택하거나 업로드해야 합니다.");
                     }
                 }
             }
         });
     });

    if (startTrainingButton) {
        startTrainingButton.addEventListener('click', () => {
            if (!startTrainingButton.disabled) {
                 simulateTraining(false);
            }
        });
    }

    if (retrainButton) {
        retrainButton.addEventListener('click', () => {
            simulateTraining(true);
        });
    }

    updateDemoUI(); 
    // --- 기존 데모 플랫폼 UI 스크립트 종료 ---


    // --- 스크롤 시 부드러운 배경색 변경 스크립트 시작 ---
    const sectionsWithBgColor = document.querySelectorAll('section[data-bg-color]');
    const bodyElement = document.body;
    const ctaBottomSection = document.getElementById('cta-bottom');

    function isColorDark(hexColor) {
      if (!hexColor) return false;
      const color = (hexColor.charAt(0) === '#') ? hexColor.substring(1, 7) : hexColor;
      const r = parseInt(color.substring(0, 2), 16); 
      const g = parseInt(color.substring(2, 4), 16); 
      const b = parseInt(color.substring(4, 6), 16); 
      const hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
      );
      return hsp < 127.5;
    }


    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.4 
    };

    const backgroundChangeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const newBgColor = entry.target.dataset.bgColor;
          if (newBgColor) {
            bodyElement.style.backgroundColor = newBgColor;

            if (entry.target.id === 'cta-bottom') {
              if (isColorDark(newBgColor)) {
                  ctaBottomSection.style.color = 'white';
                  ctaBottomSection.querySelectorAll('h2, p').forEach(el => el.style.color = 'white');
              } else {
                  ctaBottomSection.style.color = 'var(--text-color)';
                  ctaBottomSection.querySelectorAll('h2, p').forEach(el => el.style.color = 'var(--text-color)');
              }
            }
          }
        }
      });
    }, observerOptions);

    sectionsWithBgColor.forEach(section => {
      backgroundChangeObserver.observe(section);
    });
    // --- 스크롤 시 부드러운 배경색 변경 스크립트 종료 ---

});