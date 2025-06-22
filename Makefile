MINIFIER ?= minify
VARIANTS := md1 md2 md3

.PHONY: cleam all $(VARIANTS) combine

all: $(VARIANTS) combine

clean:
	rm mm-*.min.css

$(VARIANTS):
	@echo "MINIFY ($(MINIFIER)) $@"
	@$(MINIFIER) --type=css -b $@/*.css -o mm-$@.min.css

combine:
	@echo "COMBINE mm-md1.min.css + mm-md2.min.css + mm-md3.min.css -> mm-all.min.css"
	@cat mm-*.min.css > mm-all.min.css