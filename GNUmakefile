MINIFIER ?= minify
VARIANTS := md1 md2 md3
EXAMPLES := $(shell find md1/example -type f -name '*.html')
SCREENSHOTS := $(patsubst %.html,%.png,$(notdir $(EXAMPLES)))

.PHONY: cleam all $(VARIANTS) combine screenshots 

all: $(VARIANTS) combine

clean:
	rm mm-*.min.css

$(VARIANTS):
	@echo " MINIFY ($(MINIFIER)) $@"
	@$(MINIFIER) --type=css -b $@/*.css -o mm-$@.min.css

combine:
	@echo "COMBINE mm-md1.min.css + mm-md2.min.css + mm-md3.min.css -> mm-all.min.css"
	@cat mm-*.min.css > mm-all.min.css

screenshots: $(SCREENSHOTS)

%.png: md1/example/%.html
	@echo "SCRSHOT $< -> doc/screenshot/$@"
	@chromium --headless --disable-gpu --window-size=1024x768 --screenshot=./doc/images/$@ file://$(PWD)/$< >/dev/null 2>&1