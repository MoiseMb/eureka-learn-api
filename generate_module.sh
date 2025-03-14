#!/bin/zsh

# Liste des modèles
models=( "classroom" "user" "subject" "submission" "correction" )

for model in "${models[@]}"
do
  echo "Generating module, service, and controller for $model..."
  
  # Générer le module
  nest g mo $model

  # Générer le service
  nest g s $model/services/$model --flat

  # Générer le contrôleur
  nest g co $model/controllers/$model --flat

  # Générer les DTOs
  mkdir -p src/$model/dto
  touch src/$model/dto/create-$model.dto.ts
  touch src/$model/dto/update-$model.dto.ts

  echo "$model generated successfully!"
done

echo "All models generated!"