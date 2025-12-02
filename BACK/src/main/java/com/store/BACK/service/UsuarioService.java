package com.store.BACK.service;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
    }

    public Usuario getUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Nenhum usuário autenticado encontrado.");
        }
        String email = (String) authentication.getPrincipal();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário logado não encontrado no banco de dados."));
    }

    public UsuarioDTO getDadosUsuario(Usuario usuarioLogado) {
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com ID: " + usuarioLogado.getId()));

        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setCpf(usuario.getCpf());
        dto.setTelefone(usuario.getTelefone());
        dto.setRole(usuario.getRole());
        dto.setEnderecos(usuario.getEnderecos());
        dto.setPedidos(null);

        return dto;
    }

    // --- MÉTODO ATUALIZAR DADOS (SEM E-MAIL) ---
    public UsuarioDTO atualizarDados(Usuario usuarioLogado, UsuarioDTO dados) {
        Usuario usuario = usuarioRepository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        // Atualiza Nome
        if (dados.getNome() != null && !dados.getNome().isBlank()) {
            usuario.setNome(dados.getNome());
        }

        // Atualiza CPF
        if (dados.getCpf() != null) {
            usuario.setCpf(dados.getCpf());
        }

        // Atualiza Telefone
        if (dados.getTelefone() != null) {
            usuario.setTelefone(dados.getTelefone());
        }

        // REMOVIDA A LÓGICA DE ATUALIZAÇÃO DE E-MAIL
        // O e-mail permanece o mesmo que já estava no banco.

        usuarioRepository.save(usuario);
        return getDadosUsuario(usuario);
    }
    // -------------------------------------------

    public void createPasswordResetToken(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o e-mail: " + email));

        String token = UUID.randomUUID().toString();
        usuario.setPasswordResetToken(token);
        usuario.setTokenExpiryDate(LocalDateTime.now().plusHours(1));

        usuarioRepository.save(usuario);

        emailService.sendPasswordResetEmail(usuario.getEmail(), token);
    }

    public void resetPassword(String token, String newPassword) {
        Usuario usuario = usuarioRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token de redefinição inválido ou não encontrado."));

        if (usuario.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            usuario.setPasswordResetToken(null);
            usuario.setTokenExpiryDate(null);
            usuarioRepository.save(usuario);
            throw new RuntimeException("Token de redefinição expirado.");
        }

        usuario.setSenha(passwordEncoder.encode(newPassword));
        usuario.setPasswordResetToken(null);
        usuario.setTokenExpiryDate(null);

        usuarioRepository.save(usuario);
    }
}