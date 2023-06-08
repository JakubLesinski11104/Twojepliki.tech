package upload.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import upload.model.PlikInfo;
import upload.odpowiedz.KomunikatOdpowiedzi;
import upload.usluga.UsługaPrzechowywaniaPlikow;

@Controller
@CrossOrigin("http://localhost:8080")
public class FilesController {

  @Autowired
  UsługaPrzechowywaniaPlikow storageService;

  @PostMapping("/wyslij")
  public ResponseEntity<KomunikatOdpowiedzi> uploadFile(@RequestParam("file") MultipartFile file) {
    String message = "";
    
    try {
      storageService.zapisz(file);

      message = "Wrzucono plik: " + file.getOriginalFilename();
      return ResponseEntity.status(HttpStatus.OK).body(new KomunikatOdpowiedzi(message));
    } catch (Exception e) {
      message = "Nie wrzucono plik: " + file.getOriginalFilename() + ". Error: " + e.getMessage();
      return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new KomunikatOdpowiedzi(message));
    }
  }

  @GetMapping("/pliki")
  public ResponseEntity<List<PlikInfo>> getListFiles() {
    List<PlikInfo> fileInfos = storageService.wczytaj().map(path -> {
      String filename = path.getFileName().toString();
      String url = MvcUriComponentsBuilder
          .fromMethodName(FilesController.class, "getFile", path.getFileName().toString()).build().toString();

      return new PlikInfo(filename, url);
    }).collect(Collectors.toList());

    return ResponseEntity.status(HttpStatus.OK).body(fileInfos);
  }

  @GetMapping("/pliki/{filename:.+}")
  public ResponseEntity<Resource> getFile(@PathVariable String filename) {
    Resource file = storageService.wyslij(filename);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"").body(file);
  }

  @DeleteMapping("/pliki/{filename:.+}")
  public ResponseEntity<KomunikatOdpowiedzi> deleteFile(@PathVariable String filename) {
    String message = "";
    
    try {
      boolean isttnieje = storageService.usun(filename);
      
      if (isttnieje) {
        message = "Usunieto plik: " + filename;
        return ResponseEntity.status(HttpStatus.OK).body(new KomunikatOdpowiedzi(message));
      }
      
      message = "Plik nie istnieje";
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new KomunikatOdpowiedzi(message));
    } catch (Exception e) {
      message = "Nie mozna usunac: " + filename + ". Error: " + e.getMessage();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new KomunikatOdpowiedzi(message));
    }
  }
}
