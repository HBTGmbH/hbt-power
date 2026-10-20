# Free stand-in for the HBT font Simplon Norm in PDFs (Noto Sans, SIL Open Font License; copyright and license are in
# the font files). Only the four weights the templates use, see PdfFonts
FROM docker.io/azul/zulu-openjdk-alpine:13-jre AS fallback-fonts
RUN apk add --no-cache font-noto

FROM docker.io/azul/zulu-openjdk-alpine:13-jre
# BIRT lays out text via AWT, which needs fontconfig and at least one font on Alpine
RUN apk add --no-cache fontconfig ttf-dejavu
COPY --from=fallback-fonts /usr/share/fonts/noto/NotoSans-Light.ttf /usr/share/fonts/noto/NotoSans-Regular.ttf \
     /usr/share/fonts/noto/NotoSans-Medium.ttf /usr/share/fonts/noto/NotoSans-Bold.ttf /usr/share/fonts/pwr-fallback/
# Simplon Norm is licensed and never part of the image: mount a directory with its font files at /fonts
# (export.font-directory); without it, PDFs use the fonts above
COPY target/pwr-report-service-*.jar pwr-report-service.jar
ENV LC_ALL de_DE.UTF-8
ENV LANG de_DE.UTF-8
ENV LANGUAGE de_DE.UTF-8
CMD ["java", "-jar", "pwr-report-service.jar"]
