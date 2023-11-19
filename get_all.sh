# Add the wanted playlist IDs to this array, and run the script
# A folder for each playlist will be created with the playlist ID in the name, so you can find it again
# An audio file, along with a thumbnail image, description, and webloc link will be written for each video

# This is a demo script whic has been built into a better node script. Be advised it might not work.

declare -a jungle=("PLWlDzqAqb2cmEHvaHbcjnd_2a-TiccKgT" "PLXas4svwLCl4WzaMhFL1Zy6QbUggh2iBf" "PLRtPlGdIJeXZfztXfL38304OkgN2CCvBq" "PLVrM3S8MoT4oNwlthoEnyQSMhEAQV9Ykq" "PLcG45SwkJ9ubNeItHAQtImrTI36xLmWrG" "PL6F40DAEDA540FE69" "PLVYvQyiX4riGUSnuRHnoPgjDad1gk_z8w" "PL60910B40792CD50D" "PLHMyStonzbmRFgTw0Ui_qP2VcIufEuOXg" "PL6-h23UOoJ8lVA5lNXWac-v-y5MrwC0el" "PL-v2ZeBazuxGGK3IdJdRmji9iUBYa3mH5")

declare -a proghouse=("PLD6PdoxCrfx9zAEZLEIuqkMpQ4_qKQaVe" "PL8YJxEPG238viCnhi-rMjkqOyCWkH-CyK" "PLMdPIsQnk_E8iOlnVDJ3P-MhEOYQMpBv0" "PLwotGpNEQbBKYUcZUnjPAxP4yAtx1E8HR" "PL5tTvuGI_Lhj2TgyimIVurN0l9oLFR1Ff" "PLCvbjVpt7cQ26Nfo5_aHpjQxfQeLwKEHW" "PLQCP6lFMx0Qy9NI6U755EhXc3k-SkWgfW" "PL98HXIhsoQZqsrhNTILdJyZqpXWiMKWkw" "PLO9Q_uEOpXqSoLdEJEFeV3UyONoDniuxg")
declare -a rootsreggae=("PLwY9l4M25GOJqIx-Dn-PmYs1KjPd80-1N", "PL9tY0BWXOZFtd2_FhMAWoiMW0r5X-Sveo" "PL6979A4BC1209DEA6" "PL0seif7Bs4qXqdSKQRcuVGQWcQ_tmLSqf" "PLCDCA35518D91DF75" "RDCLAK5uy_nGgzkCTUJrY6A8IWiySTH-NK_7dNOB5Bk")
declare -a phonk=("PL0phUzFhhvnNnX_26ybcSK6ZDRgPM2JRL" "PLliiMqsVIF-OPMfR4mlwvdVLMp9ko0QKY" "PLeZo-g7MgUlFrrsJ5rZvz5cgwXka6y1kV")


# get length of an array
length=${#phonk[@]}
 
# use C style for loop syntax to read all values and indexes
for (( j=0; j<length; j++ ));
do
  printf "GETTING - https://www.youtube.com/playlist?list=${phonk[$j]}\n"
  yt-dlp -f 'bestaudio[ext=m4a]' --hls-prefer-ffmpeg \
    --write-thumbnail --yes-playlist --extract-audio --audio-quality 0 \
    -o 'Phonk/%(title)s[%(id)s].%(ext)s' \
    -o 'thumbnail:Phonk/%(title)s[%(id)s].%(ext)s' \
    "https://www.youtube.com/playlist?list=${phonk[$j]}"
done
